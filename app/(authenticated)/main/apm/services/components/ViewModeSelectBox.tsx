import { FiList, FiMap } from 'react-icons/fi';
interface ListMapProps {
  selected: 'list' | 'map';
  onSelect: (type: 'list' | 'map') => void;
}

export default function ViewModeSelectBox({ selected, onSelect }: ListMapProps) {
  return (
    <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit bg-white">
      <button
        type="button"
        className={`flex items-center gap-2 px-4 py-2 transition-colors focus:outline-none
          ${selected === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
        `}
        style={{ border: 'none' }}
        onClick={() => onSelect('list')}
      >
        <FiList size={20} />
        <span className="font-medium">리스트</span>
      </button>
      <button
        type="button"
        className={`flex items-center gap-2 px-4 py-2 transition-colors focus:outline-none
          ${selected === 'map' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
        `}
        style={{ border: 'none' }}
        onClick={() => onSelect('map')}
      >
        <FiMap size={20} />
        <span className="font-medium">맵</span>
      </button>
    </div>
  );
}
