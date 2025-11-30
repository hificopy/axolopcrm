import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";

export default function AffiliateSidebarButton() {
  const { openPopup } = useAffiliatePopup();

  return (
    <div className="px-3 py-3">
      <div
        className="rounded-2xl p-4"
        style={{
          background: '#3F0D28',
          border: '1px solid rgba(63, 13, 40, 0.8)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="text-center mb-3">
          <p className="text-white text-sm font-bold leading-snug">
            Refer Axolop & earn
            <br />
            40% for life
          </p>
        </div>
        {/* White Button */}
        <button
          onClick={openPopup}
          className="w-full rounded-full py-2.5 px-4 text-sm font-black tracking-wide bg-white hover:bg-gray-50 text-[#3F0D28] border-2 border-white transition-colors"
        >
          Share now
        </button>
      </div>
    </div>
  );
}
