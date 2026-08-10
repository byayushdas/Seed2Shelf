const fs = require('fs');

let distContent = fs.readFileSync('pages/distributor/profile/index.tsx', 'utf8');

const distJSX = `
        {/* 5. Registered Distributor Record Section */}
        <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-green-300 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#00d26a]" />
            Registered Distributor Record
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Company Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {companyName || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Location</label>
              {editMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                  />
                  <button
                    type="button"
                    onClick={handleDetectGPSLocation}
                    disabled={isLocating}
                    className="shrink-0 px-4 py-3 bg-[#00d26a]/10 hover:bg-[#00d26a]/20 border border-[#00d26a]/30 text-[#00d26a] rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <LocateFixed className="w-4 h-4" />
                    {isLocating ? "Locating..." : "Current Location"}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {location || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Storage Capacity</label>
              {editMode ? (
                <input
                  type="text"
                  value={storageCapacity}
                  onChange={(e) => setStorageCapacity(e.target.value)}
                  placeholder="e.g. 5000 sq ft"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {storageCapacity || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Operating Facilities</label>
              {editMode ? (
                <input
                  type="text"
                  value={operatingFacilities}
                  onChange={(e) => setOperatingFacilities(e.target.value)}
                  placeholder="e.g. 3 Warehouses"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {operatingFacilities || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Transport Fleet</label>
              {editMode ? (
                <input
                  type="text"
                  value={transportFleet}
                  onChange={(e) => setTransportFleet(e.target.value)}
                  placeholder="e.g. 15 Trucks"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {transportFleet || "Not Registered"}
                </div>
              )}
            </div>
          </div>
        </div>
`;
distContent = distContent.replace(/\{\/\* 5\. Registered Distributor Record \*\/\}/, distJSX);
fs.writeFileSync('pages/distributor/profile/index.tsx', distContent);


let retContent = fs.readFileSync('pages/retailer/profile/index.tsx', 'utf8');

const retJSX = `
        {/* 5. Registered Store Record Section */}
        <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-green-300 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#00d26a]" />
            Registered Retail Store Record
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Store Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Enter store name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {storeName || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Store Location</label>
              {editMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    placeholder="Enter location"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                  />
                  <button
                    type="button"
                    onClick={handleDetectGPSLocation}
                    disabled={isLocating}
                    className="shrink-0 px-4 py-3 bg-[#00d26a]/10 hover:bg-[#00d26a]/20 border border-[#00d26a]/30 text-[#00d26a] rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <LocateFixed className="w-4 h-4" />
                    {isLocating ? "Locating..." : "Current Location"}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {storeLocation || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Shelf Capacity</label>
              {editMode ? (
                <input
                  type="text"
                  value={shelfCapacity}
                  onChange={(e) => setShelfCapacity(e.target.value)}
                  placeholder="e.g. 500 items"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {shelfCapacity || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Store Type Focus</label>
              {editMode ? (
                <input
                  type="text"
                  value={storeTypeFocus}
                  onChange={(e) => setStoreTypeFocus(e.target.value)}
                  placeholder="e.g. Organic, Supermarket"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {storeTypeFocus || "Not Registered"}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2">Employee Count</label>
              {editMode ? (
                <input
                  type="text"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d26a] transition"
                />
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-semibold text-white">
                  {employeeCount || "Not Registered"}
                </div>
              )}
            </div>
          </div>
        </div>
`;
retContent = retContent.replace(/\{\/\* 5\. Registered Retail Store Record \*\/\}/, retJSX);
fs.writeFileSync('pages/retailer/profile/index.tsx', retContent);

console.log('JSX blocks injected for Distributor and Retailer profiles');
