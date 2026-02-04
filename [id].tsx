import { useRouter } from 'next/router';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

/**
 * Contract dashboard page.
 *
 * This page lists all milestones associated with a given contract and exposes
 * actions based on the logged‑in user's role and relationship to the contract.
 *
 * Clients can fund a milestone (deposit funds into escrow) and release
 * payment once work is delivered. Freelancers can submit work when a
 * milestone has been funded. These actions update the milestone status in
 * the `public.milestones` table accordingly.
 */
export default function ContractDashboard() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  // Use Supabase client without providing a generic Database type.  If you
  // generated types via supabase codegen, you can import them here and
  // replace `any` accordingly.  For this example we leave it untyped.
  const supabase = useSupabaseClient();
  const session = useSession();

  // Local state for contract, milestones and profile
  const [contract, setContract] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // State for messaging
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Payment related state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{ invoice_id: string; qr_url: string } | null>(null);
  const [currentMilestoneId, setCurrentMilestoneId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | null>(null);

  // Fetch contract and milestones once contract ID and session are ready
  useEffect(() => {
    if (id && session) {
      fetchProfile();
      fetchContractAndMilestones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session]);

  // When contract is loaded, fetch existing messages and set up realtime subscription
  useEffect(() => {
    // Only subscribe when contract is defined and user session exists
    if (!id || !contract || !session) return;
    fetchMessages();
    const channel = supabase
      .channel(`contract-chat-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `contract_id=eq.${id}`,
        },
        (payload: any) => {
          const newMsg = payload.new;
          // Append only if belongs to this contract
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, contract, session]);

  /**
   * Load the current user's profile.  We store the user's role and
   * identifier in the `profiles` table separate from the built‑in auth
   * schema.  This enables role‑based logic on the frontend.
   */
  async function fetchProfile() {
    const user = session?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('Error loading profile:', error.message);
    }
    setProfile(data);
  }

  /**
   * Retrieve the contract record along with its milestones.  We keep
   * contract details in state to verify that the current user is either
   * the client or freelancer associated with the contract.
   */
  async function fetchContractAndMilestones() {
    setLoading(true);
    setError(null);
    try {
      // Fetch the contract record
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();
      if (contractError) throw contractError;
      setContract(contractData);

      // Fetch milestones associated with this contract, ordered by creation
      const { data: milestonesData, error: milestoneError } = await supabase
        .from('milestones')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: true });
      if (milestoneError) throw milestoneError;
      setMilestones(milestonesData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch existing messages for this contract.  Messages are ordered by
   * creation time ascending to preserve the conversation order.
   */
  async function fetchMessages() {
    if (!id) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contract_id', id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching messages:', error.message);
      return;
    }
    setMessages(data || []);
    // Scroll to bottom after initial load
    setTimeout(() => scrollToBottom(), 50);
  }

  /**
   * Scroll the messages container to the bottom so the latest message is visible.
   */
  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Send a new message.  The receiver is determined by the current user's
   * relationship to the contract.  After inserting the message, the
   * input field is cleared.  Supabase realtime will automatically
   * append the new message to the messages state.
   */
  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !contract || !profile) return;
    const senderId = profile.id;
    const receiverId =
      profile.id === contract.client_id ? contract.freelancer_id : contract.client_id;
    try {
      const { error: insertError } = await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        contract_id: id,
      });
      if (insertError) throw insertError;
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err.message);
      setError(err.message || 'Мессеж илгээхэд алдаа гарлаа.');
    }
  }

  /**
   * Perform a status update on a milestone.  Accepts the milestone ID and
   * the new status string.  After updating, milestones are re‑fetched
   * to reflect the latest state.  A loading indicator is toggled during
   * the operation to prevent multiple simultaneous updates.
   */
  async function updateMilestoneStatus(milestoneId: string, newStatus: string) {
    setActionLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', milestoneId);
      if (updateError) throw updateError;
      // Reload milestones to reflect changes
      await fetchContractAndMilestones();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Milestone шинэчлэхэд алдаа гарлаа.');
    } finally {
      setActionLoading(false);
    }
  }

  // Handler wrappers for readability
  // When a client decides to fund a milestone we initiate the payment flow
  const handleFund = (mid: string, amount: number) => initiatePayment(mid, amount);
  const handleRelease = (mid: string) => updateMilestoneStatus(mid, 'released');
  const handleSubmit = (mid: string) => updateMilestoneStatus(mid, 'in_review');

  // Simple role checks for conditional rendering
  const isClient = profile?.role === 'client' && contract?.client_id === profile?.id;
  const isFreelancer = profile?.role === 'freelancer' && contract?.freelancer_id === profile?.id;

  /**
   * Create a QPay invoice and display a modal with the QR code.  We call
   * our backend API route to generate a mock invoice.  After the invoice
   * is created we poll its status every few seconds.  When the status
   * becomes `paid` we update the milestone status in the database and
   * close the modal.
   */
  async function initiatePayment(milestoneId: string, amount: number) {
    try {
      setError(null);
      // Call the API route to create a new invoice
      const res = await fetch('/api/qpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, contractId: id, milestoneId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Төлбөрийн хүсэлт илгээхэд алдаа гарлаа.');
      }
      const data = await res.json();
      setInvoiceData({ invoice_id: data.invoice_id, qr_url: data.qr_url });
      setCurrentMilestoneId(milestoneId);
      setIsPaymentModalOpen(true);
      setPaymentStatus('pending');
      // Start polling for payment confirmation
      pollPaymentStatus(data.invoice_id, milestoneId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Төлбөрийн хүсэлт илгээхэд алдаа гарлаа.');
    }
  }

  /**
   * Poll the backend for invoice status every few seconds.  Once the
   * invoice is paid we update the milestone status to funded and stop
   * polling.
   */
  function pollPaymentStatus(invoiceId: string, milestoneId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/qpay?invoice_id=${invoiceId}`);
        const data = await res.json();
        if (data.status === 'paid') {
          clearInterval(interval);
          setPaymentStatus('paid');
          // Update milestone status in database
          await updateMilestoneStatus(milestoneId, 'funded');
          setIsPaymentModalOpen(false);
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
        // If polling fails, you may choose to stop polling or continue
      }
    }, 5000);
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Уншиж байна...</p>
      </div>
    );
  }

  // Authorization: ensure the user is part of the contract
  if (!contract || (!isClient && !isFreelancer)) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Нэвтрэх эрх олдоогүй</h2>
        <p>Та энэ гэрээтэй холбогдоогүй эсвэл нэвтрээгүй байна.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Гэрээний мэдээлэл</h1>
      {/* Contract summary */}
      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">{contract?.title || 'Milestone гэрээ'}</h2>
        <p className="text-gray-600 mb-1"><span className="font-semibold">Ажлын нэр:</span> {contract?.project_title || contract?.title || ''}</p>
        <p className="text-gray-600 mb-1"><span className="font-semibold">Нийт дүн:</span> {contract?.total_amount}</p>
        <p className="text-gray-600"><span className="font-semibold">Төлөв:</span> {contract?.status}</p>
      </div>
      {error && (
        <div className="mb-4 text-red-600">{error}</div>
      )}
      <h2 className="text-xl font-semibold mb-4">Milestones</h2>
      {milestones.length === 0 && (
        <p className="text-gray-600">Энэ гэрээнд хамаарах milestone байхгүй.</p>
      )}
      <div className="space-y-4 mb-8">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-white shadow border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">{m.title || m.name}</h3>
              <p className="text-gray-600 mb-1">{m.description}</p>
              <p className="text-gray-600 mb-1">Дүн: <span className="font-semibold">{m.amount}</span></p>
              <p className="text-gray-600">Төлөв: <span className="font-semibold capitalize">{m.status}</span></p>
            </div>
            <div className="mt-3 md:mt-0 md:ml-4 flex space-x-2">
              {/* Client actions */}
              {isClient && m.status === 'pending' && (
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => handleFund(m.id, m.amount)}
                  disabled={actionLoading}
                >
                  Fund Milestone
                </button>
              )}
              {isClient && (m.status === 'funded' || m.status === 'in_review') && (
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  onClick={() => handleRelease(m.id)}
                  disabled={actionLoading}
                >
                  Release Payment
                </button>
              )}
              {/* Freelancer actions */}
              {isFreelancer && m.status === 'funded' && (
                <button
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                  onClick={() => handleSubmit(m.id)}
                  disabled={actionLoading}
                >
                  Submit Work
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat interface */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Чат</h2>
        <div className="h-64 overflow-y-auto mb-4 flex flex-col space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs md:max-w-sm px-3 py-2 rounded-lg text-sm flex flex-col ${
                msg.sender_id === profile?.id
                  ? 'bg-blue-500 text-white self-end'
                  : 'bg-gray-200 text-gray-800 self-start'
              }`}
            >
              <span>{msg.content}</span>
              <span className="text-[10px] mt-1 opacity-75">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Мессеж бичих..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={!newMessage.trim()}
          >
            Илгээх
          </button>
        </form>
      </div>
    </div>
      {/* Payment modal for funding milestones */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-4">QPay төлбөр</h3>
            {paymentStatus === 'pending' ? (
              <>
                <p className="mb-2">Доорх QR кодыг ашиглан төлбөрөө төлнө үү.</p>
                {invoiceData?.qr_url && (
                  <img
                    src={invoiceData.qr_url}
                    alt="QPay QR код"
                    className="mx-auto mb-4 w-48 h-48 object-contain"
                  />
                )}
                <p className="text-sm text-gray-600">Төлбөр хүлээгдэж байна...</p>
              </>
            ) : (
              <p className="text-green-600 font-medium">Төлбөр амжилттай төлөгдсөн. Милестоун санхүүжүүлэгдлээ!</p>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
  );
}