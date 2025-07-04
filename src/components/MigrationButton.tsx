
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { migrateAllDataToSupabase, checkMigrationNeeded } from '@/utils/dataMigration';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const MigrationButton = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { isAuthenticated } = useSupabaseAuth();
  
  const needsMigration = checkMigrationNeeded();

  const handleMigration = async () => {
    if (!isAuthenticated) {
      alert('Войдите в систему для миграции данных');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('idle');

    try {
      const result = await migrateAllDataToSupabase();
      if (result.success) {
        setMigrationStatus('success');
        console.log('🎉 Миграция завершена успешно!');
      } else {
        setMigrationStatus('error');
        console.error('❌ Ошибка миграции:', result.error);
      }
    } catch (error) {
      setMigrationStatus('error');
      console.error('❌ Ошибка миграции:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  if (!needsMigration) {
    return null;
  }

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-amber-400" />
          <div>
            <h3 className="text-white font-semibold">Миграция данных</h3>
            <p className="text-gray-300 text-sm">
              Перенесите ваши данные в облачную базу данных
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {migrationStatus === 'success' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
          {migrationStatus === 'error' && (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          
          <Button
            onClick={handleMigration}
            disabled={isMigrating || !isAuthenticated}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isMigrating ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Мигрируем...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Перенести данные
              </>
            )}
          </Button>
        </div>
      </div>
      
      {migrationStatus === 'success' && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ Данные успешно перенесены в облачную базу данных!
          </p>
        </div>
      )}
      
      {migrationStatus === 'error' && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">
            ❌ Произошла ошибка при миграции данных. Проверьте консоль для деталей.
          </p>
        </div>
      )}
    </div>
  );
};

export default MigrationButton;
