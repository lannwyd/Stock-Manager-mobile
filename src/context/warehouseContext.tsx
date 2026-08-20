import type { Warehouse } from '@/lib/data'; 
import { supabase } from '@/lib/supabase';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type WarehouseContextType = {
    warehouses: Warehouse[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from('warehouses')
            .select(`
        id,
        name,
        sections (
          id,
          name,
          color,
          floors (
            id,
            name,
            stock_batches (
              id,
              lot,
              expiry_date,
              quantity,
              products ( id, name, dci )
            )
          )
        )
      `);

        if (error) {
            setError(error.message);
        } else {
            setWarehouses(data as unknown as Warehouse[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <WarehouseContext.Provider value={{ warehouses, loading, error, refresh: fetchData }}>
            {children}
        </WarehouseContext.Provider>
    );
}

export function useWarehouseContext() {
    const ctx = useContext(WarehouseContext);
    if (!ctx) throw new Error('useWarehouses must be used within a WarehouseProvider');
    return ctx;
}