import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface RLSPolicy {
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

const TableStructure: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [policies, setPolicies] = useState<RLSPolicy[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableStructure = async () => {
      try {
        const { data: columnsData, error: columnsError } = await supabase
          .rpc('get_table_structure', { table_name: 'artworks' });

        if (columnsError) throw columnsError;

        setColumns(columnsData);

        const { data: policiesData, error: policiesError } = await supabase
          .rpc('get_rls_policies', { table_name: 'artworks' });

        if (policiesError) throw policiesError;

        setPolicies(policiesData);
      } catch (err) {
        console.error('Error fetching table structure or policies:', err);
        setError('Failed to fetch table structure or policies');
      }
    };

    fetchTableStructure();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Artwork Table Structure</h2>
      <table className="min-w-full bg-white border border-gray-300 mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Column Name</th>
            <th className="py-2 px-4 border-b">Data Type</th>
            <th className="py-2 px-4 border-b">Is Nullable</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b">{column.column_name}</td>
              <td className="py-2 px-4 border-b">{column.data_type}</td>
              <td className="py-2 px-4 border-b">{column.is_nullable}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mb-4">RLS Policies</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Policy Name</th>
            <th className="py-2 px-4 border-b">Permissive</th>
            <th className="py-2 px-4 border-b">Roles</th>
            <th className="py-2 px-4 border-b">Command</th>
            <th className="py-2 px-4 border-b">USING expression</th>
            <th className="py-2 px-4 border-b">WITH CHECK expression</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b">{policy.policyname}</td>
              <td className="py-2 px-4 border-b">{policy.permissive}</td>
              <td className="py-2 px-4 border-b">{policy.roles.join(', ')}</td>
              <td className="py-2 px-4 border-b">{policy.cmd}</td>
              <td className="py-2 px-4 border-b">{policy.qual}</td>
              <td className="py-2 px-4 border-b">{policy.with_check}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableStructure;