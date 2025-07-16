import { Link } from 'react-router-dom';

export default function DummyPage({ name }: { name: string }) {
  return (
    <div style={{ color: 'black' }}>
      <h1>Sorry, {name} is still under construction</h1>
      <Link to="/">Go back</Link>
    </div>
  );
}
