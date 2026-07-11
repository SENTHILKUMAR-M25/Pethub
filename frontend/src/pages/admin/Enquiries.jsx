import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trash2, X, Check, Loader2, MessageSquare, ChevronLeft, ChevronRight,
  Eye, User, Clock, Mail, Phone, Tag, FileText, Inbox,
} from "lucide-react";
import { getAllContacts, deleteContact, markAsRead } from "../../api/contactService";

const statusBadge = (isRead) =>
  isRead
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700";

export default function Enquiries() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") { setViewItem(null); setDeleteConfirmId(null); }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = viewItem || deleteConfirmId ? "hidden" : "unset";
  }, [viewItem, deleteConfirmId]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await getAllContacts();
      setContacts(res.data.contacts);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      setDeleteConfirmId(null);
      if (viewItem?._id === id) setViewItem(null);
      await fetchContacts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      await fetchContacts();
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
            <Inbox className="w-5 h-5 text-[#FF80C7]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Enquiries</h1>
        </div>
        <p className="text-gray-500 ml-[52px]">
          Customer messages from the contact page •{" "}
          <span className="font-medium">{contacts.filter((c) => !c.isRead).length}</span> unread
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or subject..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#FF80C7] transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF80C7]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No enquiries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((item) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors ${
                        !item.isRead ? "bg-[#FF80C7]/[0.02]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(item.isRead)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isRead ? "bg-green-500" : "bg-amber-500"}`} />
                          {item.isRead ? "Read" : "New"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{item.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!item.isRead && (
                            <button
                              onClick={() => handleMarkRead(item._id)}
                              title="Mark as read"
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewItem(item)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item._id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setViewItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#FF80C7]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1F2937]">Enquiry Details</h2>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${statusBadge(viewItem.isRead)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${viewItem.isRead ? "bg-green-500" : "bg-amber-500"}`} />
                      {viewItem.isRead ? "Read" : "New"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewItem(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Name</p>
                      <p className="text-sm font-semibold text-[#1F2937]">{viewItem.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm font-semibold text-[#1F2937]">{formatDate(viewItem.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-semibold text-[#1F2937] break-all">{viewItem.email}</p>
                    </div>
                  </div>
                  {viewItem.phone && (
                    <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm font-semibold text-[#1F2937]">{viewItem.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Subject</p>
                    <p className="text-sm font-semibold text-[#1F2937]">{viewItem.subject}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400">Message</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-[#F8FAFC] rounded-xl p-4 whitespace-pre-wrap">
                    {viewItem.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB]">
                {!viewItem.isRead && (
                  <button
                    onClick={() => { handleMarkRead(viewItem._id); setViewItem((prev) => ({ ...prev, isRead: true })); }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => { setDeleteConfirmId(viewItem._id); }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Delete Enquiry?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
