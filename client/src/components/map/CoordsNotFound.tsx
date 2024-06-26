import React from 'react';
import { CoordsNotFoundProps } from '../../types/coordsNotFoundProps';
import MapSearch from './MapSearch';

const CoordsNotFound: React.FC<CoordsNotFoundProps> = ({
  setShowSearch,
  setIsError,
  showSearch,
}) => {
  const changeLocPrefs = () => {
    setIsError(false);
    setShowSearch(true);
  };
  return (
    <div
      id="default-modal"
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black bg-opacity-20"
    >
      <div className="relative p-4 w-fit max-w-2xl max-h-full">
        {/* <!-- Modal content --> */}
        <div className="relative bg-white rounded-lg shadow">
          {/* <!-- Modal header --> */}
          <div className="flex flex-col items-center justify-between pt-8 p-4 md:p-5 rounded-t">
            <h3 className="text-sm text-error ">
              No location found, try a different location
            </h3>
            <img src="sadCat.png" width={80} />
          </div>

          {/* <!-- Modal footer --> */}
          <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b ">
            <button
              type="button"
              className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center"
              onClick={changeLocPrefs}
            >
              Change Location
            </button>
          </div>
        </div>
      </div>

      {showSearch && <MapSearch setShowSearch={setShowSearch} />}
    </div>
  );
};

export default CoordsNotFound;
