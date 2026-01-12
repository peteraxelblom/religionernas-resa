'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📵</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Du ar offline
        </h1>

        <p className="text-gray-600 mb-8">
          Anslut till internet for att fortsatta spela. Din framsteg ar sparad lokalt och kommer synkas nar du ar online igen.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
        >
          Forsok igen
        </button>

        <div className="mt-8 p-4 bg-purple-50 rounded-xl">
          <p className="text-sm text-purple-700">
            Tips: Spelet fungerar delvis offline om du besökt sidorna tidigare. Försök navigera till startsidan.
          </p>
          <Link href="/" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
            Till startsidan
          </Link>
        </div>
      </div>
    </main>
  );
}
