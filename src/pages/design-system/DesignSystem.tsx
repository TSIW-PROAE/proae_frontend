import { useState } from 'react';
import FormInput from '../../components/input/Input';

const DesignSystem = () => {
  const [name, setName] = useState('');

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-10">Design System</h1>

      {/* Inputs */}
      <section className="w-[500px] bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl mb-5">Inputs</h2>
        <div className="grid gap-4">
          <FormInput
            id="example-input"
            placeholder="Seu nome"
            onChange={(e) => setName(e.target.value)}
            label="Nome"
            value={name}
          />
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
