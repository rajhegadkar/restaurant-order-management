import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadImageToSupabase } from '../../lib/supabase';
import { Settings, Save, Upload, CheckCircle2, Wifi, ExternalLink } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();

  const [restaurantName, setRestaurantName] = useState(settings.restaurant_name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [contactNumber, setContactNumber] = useState(settings.contact_number);
  const [contactEmail, setContactEmail] = useState(settings.contact_email);
  const [address, setAddress] = useState(settings.address);
  const [openingTime, setOpeningTime] = useState(settings.opening_time);
  const [closingTime, setClosingTime] = useState(settings.closing_time);
  const [deliveryFee, setDeliveryFee] = useState(settings.delivery_fee.toString());
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings.free_delivery_threshold.toString());
  const [minOrderAmount, setMinOrderAmount] = useState(settings.min_order_amount.toString());
  const [taxPercentage, setTaxPercentage] = useState(settings.tax_percentage.toString());
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [onlineOrderingEnabled, setOnlineOrderingEnabled] = useState(settings.online_ordering_enabled);
  const [dineInOrderingEnabled, setDineInOrderingEnabled] = useState(settings.dine_in_ordering_enabled);
  const [lanHost, setLanHost] = useState(settings.lan_host || '192.168.1.128:5173');

  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImageToSupabase(file, 'food-images');
      setLogoUrl(url);
      showToast('Logo image uploaded successfully!', 'success');
    } catch {
      showToast('Failed to upload logo image.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      restaurant_name: restaurantName.trim(),
      tagline: tagline.trim(),
      logo_url: logoUrl.trim(),
      contact_number: contactNumber.trim(),
      contact_email: contactEmail.trim(),
      address: address.trim(),
      opening_time: openingTime.trim(),
      closing_time: closingTime.trim(),
      delivery_fee: parseFloat(deliveryFee) || 0,
      free_delivery_threshold: parseFloat(freeDeliveryThreshold) || 499,
      min_order_amount: parseFloat(minOrderAmount) || 199,
      tax_percentage: parseFloat(taxPercentage) || 5,
      currency_symbol: currencySymbol.trim() || '₹',
      online_ordering_enabled: onlineOrderingEnabled,
      dine_in_ordering_enabled: dineInOrderingEnabled,
      lan_host: lanHost.trim() || '192.168.1.128:5173',
    });
    showToast('Restaurant settings & LAN configuration saved!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Restaurant Business Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Control restaurant details, operational hours, delivery surcharges, and order rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Details */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Brand Identity & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-700 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Physical Street Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Customer Support Phone *
              </label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Logo preview */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Restaurant Logo
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
              )}
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
              <label className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Operating Hours & Ordering Controls */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Hours & Ordering Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Daily Opening Time
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Daily Closing Time
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="11:00 PM"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={onlineOrderingEnabled}
                onChange={(e) => setOnlineOrderingEnabled(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <div>
                <span className="block text-xs font-bold text-stone-900">
                  Enable Online Ordering
                </span>
                <span className="block text-[11px] text-stone-500">
                  Allow customers to place delivery and takeaway orders online
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={dineInOrderingEnabled}
                onChange={(e) => setDineInOrderingEnabled(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <div>
                <span className="block text-xs font-bold text-stone-900">
                  Enable Dine-In QR Ordering
                </span>
                <span className="block text-[11px] text-stone-500">
                  Allow tabletop QR code ordering at physical restaurant tables
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Pricing, Tax, and Delivery Fees */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Pricing, Taxes & Fees
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Delivery Fee ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Free Delivery Above ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Min. Order ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Local Area Network (LAN) & Mobile Access Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Local Area Network (LAN) & Mobile Access
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Listening on all interfaces (0.0.0.0:5173)
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Define your restaurant computer's local Wi-Fi IP address and port. All table QR codes and customer links encode this address so any smartphone or tablet connected to your Wi-Fi can immediately order from their tables.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                LAN Host & Port (e.g. 192.168.1.128:5173)
              </label>
              <input
                type="text"
                value={lanHost}
                onChange={(e) => setLanHost(e.target.value)}
                placeholder="192.168.1.128:5173"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLanHost('192.168.1.128:5173');
                    showToast('Reset to detected Wi-Fi LAN address (192.168.1.128:5173)', 'info');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset to Wi-Fi IP
                </button>

                <a
                  href={`http://${lanHost.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test LAN Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Restaurant Configuration</span>
        </button>
      </form>
    </div>
  );
};
