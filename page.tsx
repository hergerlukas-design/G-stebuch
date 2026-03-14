import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

// Next.js Server Component
export default async function GuestbookPage({ params }: { params: { slug: string } }) {
  // 1. Die URL-Endung (Slug) auslesen
  const { slug } = params;

  // 2. Das spezifische Gästebuch aus Supabase abrufen
  const { data: guestbook, error: guestbookError } = await supabase
    .from('guestbooks')
    .select('*')
    .eq('slug', slug)
    .single();

  // Wenn das Buch nicht existiert (z.B. falsche URL), zeigen wir eine 404-Seite
  if (guestbookError || !guestbook) {
    notFound();
  }

  // 3. Alle bisherigen Einträge für dieses Gästebuch abrufen (chronologisch sortiert)
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('*')
    .eq('guestbook_id', guestbook.id)
    .order('created_at', { ascending: true });

  const safeEntries = entries || [];

  return (
    <main className="min-h-screen bg-stone-100 p-4 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-8 text-stone-800 text-center">
        {guestbook.title}
      </h1>
      
      {/* HINWEIS: Hier kommt im nächsten Schritt unser 3D-Buch (Client Component) rein. 
        Für den Moment rendern wir eine simple Liste, um zu prüfen, 
        ob unsere Datenbankverbindung einwandfrei funktioniert. 
      */}
      
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Bisherige Einträge ({safeEntries.length})
        </h2>
        
        {safeEntries.length === 0 ? (
          <p className="text-stone-500 italic text-center py-8">
            Noch keine Einträge vorhanden. Sei der oder die Erste!
          </p>
        ) : (
          <ul className="space-y-6">
            {safeEntries.map((entry) => (
              <li key={entry.id} className="bg-stone-50 p-4 rounded-md border border-stone-200 shadow-sm">
                <p className="font-bold text-stone-800 text-lg">{entry.guest_name}</p>
                {entry.message && <p className="mt-2 text-stone-600">{entry.message}</p>}
                
                {entry.image_url && (
                  // Hier nutzen wir vorerst einen normalen img-Tag. 
                  // Später optimieren wir das für das Blätter-Layout.
                  <img 
                    src={entry.image_url} 
                    alt={`Eintrag von ${entry.guest_name}`} 
                    className="mt-4 max-w-full h-auto rounded-md shadow-sm border border-stone-200"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Platzhalter: Hier kommt später das interaktive Upload-Formular hin */}
      <button className="fixed bottom-8 bg-stone-800 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-stone-700 transition-transform transform hover:scale-105">
        Eintrag hinzufügen
      </button>
    </main>
  );
}
