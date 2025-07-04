
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Search, Download, Upload, Trash2 } from 'lucide-react';
import { debugStorage, backupAllData, restoreFromBackup } from '@/utils/debug';
import { getBooks, getUsers, getChapters, clearAllData } from '@/utils/storage';

const DiagnosticPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string>('');

  const runDiagnostic = () => {
    console.clear();
    console.log('🔍 ЗАПУСК ПОЛНОЙ ДИАГНОСТИКИ...');
    
    // Запускаем диагностику storage
    debugStorage();
    
    // Проверяем функции
    const books = getBooks();
    const users = getUsers();
    const chapters = getChapters();
    
    const result = `
📊 РЕЗУЛЬТАТЫ ДИАГНОСТИКИ:
• Книг в системе: ${books.length}
• Пользователей: ${users.length}
• Глав: ${chapters.length}
• Размер localStorage: ${Math.round(JSON.stringify(localStorage).length / 1024)} KB

📝 Подробности в консоли браузера (F12)
    `.trim();
    
    setDiagnosticResult(result);
    console.log('✅ Диагностика завершена');
  };

  const createBackup = () => {
    const backup = backupAllData();
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookcraft_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        restoreFromBackup(backup);
        alert('Данные восстановлены! Перезагрузите страницу.');
      } catch (error) {
        alert('Ошибка при восстановлении данных: ' + error);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 bg-red-500 text-white border-red-600 hover:bg-red-600"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        SOS
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Экстренная диагностика
          </CardTitle>
          <CardDescription>
            Панель для диагностики и восстановления данных
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={runDiagnostic} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Диагностика
            </Button>
            
            <Button onClick={createBackup} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Скачать бэкап
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="restore-file"
              />
              <Button 
                onClick={() => document.getElementById('restore-file')?.click()}
                variant="outline" 
                className="flex items-center gap-2 w-full"
              >
                <Upload className="h-4 w-4" />
                Загрузить бэкап
              </Button>
            </div>
            
            <Button 
              onClick={() => {
                if (confirm('ВНИМАНИЕ! Это удалит ВСЕ данные. Вы уверены?')) {
                  clearAllData();
                  alert('Все данные очищены');
                }
              }}
              variant="destructive" 
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Очистить всё
            </Button>
          </div>
          
          {diagnosticResult && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{diagnosticResult}</pre>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Закрыть
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticPanel;
