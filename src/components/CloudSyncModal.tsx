import React, { useState } from 'react';
import { AppData } from '../types';
import { X, Cloud, Download, Upload, Copy, Check, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import { pixelSound } from '../utils/sound';

interface Props {
  appData: AppData;
  isOpen: boolean;
  onClose: () => void;
  onRestoreData: (newData: AppData) => void;
  onResetData: () => void;
  onUpdateSyncStatus: (code: string, timestamp: string) => void;
}

export const CloudSyncModal: React.FC<Props> = ({
  appData,
  isOpen,
  onClose,
  onRestoreData,
  onResetData,
  onUpdateSyncStatus,
}) => {
  const [syncCode, setSyncCode] = useState(appData.settings.syncCode || '');
  const [loadCodeInput, setLoadCodeInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate random 6-character code
  const generateNewCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MC-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Save to Cloud Express API
  const handleCloudSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    pixelSound.playClick();

    const codeToUse = syncCode || generateNewCode();

    try {
      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToUse,
          payload: appData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSyncCode(json.syncCode);
        onUpdateSyncStatus(json.syncCode, json.updatedAt);
        setStatusMessage({
          type: 'success',
          text: `云端同步成功！跨设备云同步码：${json.syncCode}`,
        });
        pixelSound.playCoin();
      } else {
        setStatusMessage({
          type: 'error',
          text: json.error || '云同步保存失败，请稍后重试。',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: '网络连接失败，请检查服务器状态。',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load from Cloud Express API
  const handleCloudLoad = async () => {
    if (!loadCodeInput.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    pixelSound.playClick();

    try {
      const cleanCode = loadCodeInput.trim().toUpperCase();
      const res = await fetch(`/api/sync/load/${cleanCode}`);
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        onRestoreData(json.data);
        onUpdateSyncStatus(cleanCode, json.updatedAt);
        setStatusMessage({
          type: 'success',
          text: `已从云端同步数据成功！（同步码: ${cleanCode}）`,
        });
        pixelSound.playLevelUp();
      } else {
        setStatusMessage({
          type: 'error',
          text: json.error || '未找到该云同步码，请核对后重试。',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: '无法连接云同步服务器。',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    pixelSound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `minecraft_study_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.character && parsed.tasks) {
            onRestoreData(parsed);
            setStatusMessage({
              type: 'success',
              text: '本地备份文件导入成功！数据已更新。',
            });
            pixelSound.playLevelUp();
          } else {
            setStatusMessage({
              type: 'error',
              text: '文件格式不合规，请上传有效的备份 JSON 文件。',
            });
          }
        } catch (err) {
          setStatusMessage({
            type: 'error',
            text: '解析 JSON 备份失败。',
          });
        }
      };
    }
  };

  const copySyncCode = () => {
    if (syncCode) {
      navigator.clipboard.writeText(syncCode);
      setCopied(true);
      pixelSound.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="mc-panel-dark max-w-xl w-full p-6 relative border-4 border-[#55ffff] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#383842] mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#55ffff]/20 border border-[#55ffff]">
              <Cloud className="w-6 h-6 text-[#55ffff]" />
            </div>
            <div>
              <h3 className="text-xl font-mc-title text-[#55ffff] mc-text-shadow">
                跨设备云端同步 (Cloud Sync)
              </h3>
              <p className="text-xs text-gray-400 font-pixel mt-0.5">
                在手机、平板与电脑间无缝同步你的学习计划与方块人进度！
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              pixelSound.playClick();
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notification Status Alert */}
        {statusMessage && (
          <div
            className={`p-3 mb-4 font-pixel text-xs border-2 flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#1e2a1e] text-[#55ff55] border-[#55ff55]'
                : 'bg-[#330000] text-[#ff5555] border-[#ff5555]'
            }`}
          >
            {statusMessage.type === 'success' ? '✅' : '⚠️'} {statusMessage.text}
          </div>
        )}

        {/* SECTION 1: SAVE TO CLOUD */}
        <div className="bg-[#101014] p-4 border-2 border-[#383842] mb-4 space-y-3">
          <h4 className="font-pixel text-sm text-[#55ff55] font-bold flex items-center gap-2">
            <Cloud className="w-4 h-4" /> 1. 保存/上传当前进度到云端
          </h4>
          <p className="font-pixel text-xs text-gray-400">
            生成跨设备云同步码，即可在其他屏幕设备输入该码快速载入进度。
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloudSave}
              disabled={isSaving}
              className="mc-btn mc-btn-primary py-2 px-4 text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? '正在上传云端...' : '生成/更新云端存档'}
            </button>

            {syncCode && (
              <div className="flex items-center gap-2 bg-[#1c1c24] border-2 border-[#55ff55] px-3 py-1.5 ml-auto">
                <span className="font-pixel text-xs text-gray-400">同步码:</span>
                <span className="font-pixel text-sm font-bold text-[#55ff55]">{syncCode}</span>
                <button
                  onClick={copySyncCode}
                  className="p-1 text-gray-300 hover:text-white"
                  title="复制同步码"
                >
                  {copied ? <Check className="w-4 h-4 text-[#55ff55]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {appData.settings.lastSyncedAt && (
            <div className="font-pixel text-[10px] text-gray-500">
              上次云端同步时间：{new Date(appData.settings.lastSyncedAt).toLocaleString('zh-CN')}
            </div>
          )}
        </div>

        {/* SECTION 2: LOAD FROM CLOUD */}
        <div className="bg-[#101014] p-4 border-2 border-[#383842] mb-4 space-y-3">
          <h4 className="font-pixel text-sm text-[#ffaa00] font-bold flex items-center gap-2">
            <Key className="w-4 h-4" /> 2. 输入云同步码载入云端进度
          </h4>
          <p className="font-pixel text-xs text-gray-400">
            在其他设备上输入之前保存的 6 位云同步码（如：MC-88A2）：
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="例如: MC-88A2"
              value={loadCodeInput}
              onChange={(e) => setLoadCodeInput(e.target.value.toUpperCase())}
              className="bg-[#1a1a24] text-white font-pixel text-sm border-2 border-[#383842] px-3 py-2 flex-1 uppercase focus:outline-none focus:border-[#ffaa00]"
            />
            <button
              onClick={handleCloudLoad}
              disabled={isLoading || !loadCodeInput.trim()}
              className="mc-btn mc-btn-gold py-2 px-4 text-xs"
            >
              {isLoading ? '加载中...' : '同步载入'}
            </button>
          </div>
        </div>

        {/* SECTION 3: FILE EXPORT / IMPORT */}
        <div className="bg-[#101014] p-4 border-2 border-[#383842] mb-4 space-y-3">
          <h4 className="font-pixel text-sm text-[#55ffff] font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> 3. 本地 JSON 备份与恢复
          </h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportJSON}
              className="mc-btn mc-btn-diamond text-xs py-2 px-3 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> 导出 JSON 备份文件
            </button>

            <label className="mc-btn bg-[#3a3a4c] hover:bg-[#4a4a5c] text-xs py-2 px-3 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> 导入 JSON 备份
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* SECTION 4: RESET DANGER ZONE */}
        <div className="pt-2 flex justify-between items-center border-t border-[#2a2a35]">
          <span className="font-pixel text-[11px] text-gray-500">
            本地数据自动保存在浏览器中。
          </span>
          <button
            onClick={() => {
              if (confirm('确定要清空所有学习任务与角色进度吗？此操作无法撤销！')) {
                pixelSound.playClick();
                onResetData();
                onClose();
              }
            }}
            className="text-[11px] font-pixel text-[#ff5555] hover:underline flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> 重置所有存档数据
          </button>
        </div>
      </div>
    </div>
  );
};
