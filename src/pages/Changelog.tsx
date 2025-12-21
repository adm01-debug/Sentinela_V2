export default function Changelog() {
  const changes = [
    { version: '2.0.0', date: '2024-01-15', items: ['New dashboard', 'Dark mode'] },
    { version: '1.5.0', date: '2024-01-01', items: ['Bug fixes', 'Performance improvements'] },
  ];
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Changelog</h1>
      {changes.map(c => (
        <div key={c.version} className='mb-6'>
          <h2 className='text-xl font-semibold'>{c.version} - {c.date}</h2>
          <ul className='list-disc pl-6 mt-2'>{c.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}