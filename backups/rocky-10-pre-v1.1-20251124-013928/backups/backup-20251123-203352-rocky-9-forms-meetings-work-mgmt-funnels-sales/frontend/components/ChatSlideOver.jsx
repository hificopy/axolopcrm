import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, Hash, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Placeholder chat data
const INITIAL_CHANNELS = [
  {
    id: 1,
    name: 'general',
    type: 'channel',
    unread: 3,
    messages: [
      {
        id: 1,
        user: 'Sarah Chen',
        avatar: 'SC',
        message: 'Hey team! Just finished the Q4 review presentation.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        user: 'Mike Johnson',
        avatar: 'MJ',
        message: 'Great work Sarah! Looking forward to reviewing it.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 3,
        user: 'Emily Rodriguez',
        avatar: 'ER',
        message: 'Can we schedule a call to discuss the new features?',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
    ],
  },
  {
    id: 2,
    name: 'sales-team',
    type: 'channel',
    unread: 1,
    messages: [
      {
        id: 1,
        user: 'David Park',
        avatar: 'DP',
        message: 'Just closed the Enterprise deal with Acme Corp! 🎉',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 2,
        user: 'Lisa Anderson',
        avatar: 'LA',
        message: 'Congratulations David! That\'s amazing news!',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
      },
    ],
  },
  {
    id: 3,
    name: 'marketing',
    type: 'channel',
    unread: 0,
    messages: [
      {
        id: 1,
        user: 'Tom Williams',
        avatar: 'TW',
        message: 'New campaign performance looks great. CTR is up 45%!',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
  },
];

export default function ChatSlideOver() {
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChannel.messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: activeChannel.messages.length + 1,
      user: 'You',
      avatar: 'YO',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setChannels(channels.map(ch =>
      ch.id === activeChannel.id
        ? { ...ch, messages: [...ch.messages, message] }
        : ch
    ));

    setActiveChannel({
      ...activeChannel,
      messages: [...activeChannel.messages, message],
    });

    setNewMessage('');
  };

  const switchChannel = (channel) => {
    setActiveChannel(channel);
    // Mark as read
    setChannels(channels.map(ch =>
      ch.id === channel.id ? { ...ch, unread: 0 } : ch
    ));
  };

  const totalUnread = channels.reduce((sum, ch) => sum + ch.unread, 0);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Collapsed Bar - Glassmorphic */}
      <div className="fixed top-3 right-[160px] z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-10 w-10 flex items-center justify-center rounded-lg bg-[#791C14] text-white hover:bg-[#6b1a12] active:bg-[#5a1810] shadow-lg hover:shadow-xl hover:shadow-red-900/40 transition-all duration-200 group overflow-hidden"
          style={{ position: 'fixed', top: '12px', right: '160px' }}
        >
          <MessageSquare className="h-5 w-5 text-white group-hover:text-white transition-colors relative z-10" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-[#5a1610] rounded-full shadow-lg z-20 flex items-center justify-center text-xs text-white font-bold">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}

          {/* Tooltip - Opaque */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-gray-700">
            Chat
          </div>
        </button>
      </div>

      {/* Slide-over Panel - Glassmorphic */}
      <div
        className={`fixed top-16 right-[184px] w-[450px] backdrop-blur-2xl bg-white/95 rounded-lg shadow-2xl border border-gray-200/50 z-50 transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#791C14] to-[#6b1a12] text-white px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-bold">Team Chat</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-12rem)]">
          {/* Channel List */}
          <div className="w-40 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Channels
              </div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => switchChannel(channel)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all ${
                    activeChannel.id === channel.id
                      ? 'bg-[#791C14] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{channel.name}</span>
                  {channel.unread > 0 && activeChannel.id !== channel.id && (
                    <span className="bg-[#791C14] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Channel Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900">{activeChannel.name}</h4>
                <span className="text-xs text-gray-500">
                  {activeChannel.messages.length} messages
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {activeChannel.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#791C14] to-[#6b1a12] flex items-center justify-center text-white text-xs font-bold">
                    {msg.avatar}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {msg.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5 break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder={`Message #${activeChannel.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 h-9 text-sm border-gray-300 focus:ring-[#791C14] focus:border-[#791C14]"
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="bg-[#791C14] hover:bg-[#6b1a12] h-9 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
