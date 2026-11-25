import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { QrCode, CheckCircle2, AlertTriangle, ArrowRight, Utensils } from 'lucide-react';

export const TableOrderingRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setActiveTableByParams } = useApp();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [tableName, setTableName] = useState('');

  const tableParam = searchParams.get('table');
  const tokenParam = searchParams.get('token') || undefined;

  useEffect(() => {
    if (!tableParam) {
      setStatus('error');
      setErrorMessage('No table number was specified in the QR code.');
      return;
    }

    const timer = setTimeout(() => {
      const result = setActiveTableByParams(tableParam, tokenParam);
      if (result.success) {
        setStatus('success');
        setTableName(tableParam);
        // Automatically route to menu after 1.2 seconds
        setTimeout(() => {
          navigate('/menu');
        }, 1200);
      } else {
        setStatus('error');
        setErrorMessage(result.message);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [tableParam, tokenParam]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 p-8 shadow-xl text-center space-y-6">
        {status === 'verifying' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto animate-pulse">
              <QrCode className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Connecting to Your Table...
            </h2>
            <p className="text-xs text-stone-500">
              Validating table assignment and loading live restaurant menu...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Welcome to {tableName}!
            </h2>
            <p className="text-xs text-stone-600">
              Your table is now connected. Any items you order will be prepared and served directly to your table.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white font-semibold text-xs shadow-md"
              >
                <span>Open Table Menu Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Unable to Connect to Table
            </h2>
            <p className="text-xs text-stone-600 bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800">
              {errorMessage}
            </p>
            <p className="text-xs text-stone-500">
              Please try scanning the tabletop QR code again, or browse the standard online menu below.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Link
                to="/menu"
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs shadow-xs"
              >
                Browse Menu
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
