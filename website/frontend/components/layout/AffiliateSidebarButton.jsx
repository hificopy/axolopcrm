import { useAffiliatePopup } from './contexts/AffiliatePopupContext';

export default function AffiliateSidebarButton() {
  const { openPopup } = useAffiliatePopup();

  return (
    <div className="px-3 py-3">
      <div className="bg-[#761B14] rounded-2xl p-4 border border-[#6b1a12]">
        <div className="text-center mb-3">
          <p className="text-white text-sm font-bold leading-snug">
            Refer Axolop & earn
            <br />
            40% for life
          </p>
        </div>
        <button
          onClick={openPopup}
          className="w-full bg-white hover:bg-gray-100 text-[#761B14] font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm"
        >
          Share now
        </button>
      </div>
    </div>
  );
}
