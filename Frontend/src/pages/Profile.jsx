import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { FiKey, FiGlobe, FiCopy, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/profile");
      setUserProfile(res.data);
      setWebhookUrl(res.data.globalWebhookUrl || "");
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      setGeneratingKey(true);
      const res = await API.post("/auth/api-key");
      setUserProfile({
        ...userProfile,
        apiKey: res.data.apiKey
      });
      alert("API Key generated successfully. Make sure to copy it now!");
    } catch (error) {
      console.error(error);
      alert("Failed to generate API Key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleSaveWebhook = async () => {
    try {
      setSavingWebhook(true);
      const res = await API.post("/auth/webhook-url", {
        webhookUrl
      });
      setUserProfile({
        ...userProfile,
        globalWebhookUrl: res.data.globalWebhookUrl
      });
      alert("Global Webhook URL updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update webhook URL");
    } finally {
      setSavingWebhook(false);
    }
  };

  const copyApiKey = () => {
    if (userProfile?.apiKey) {
      navigator.clipboard.writeText(userProfile.apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-955">
        <h2 className="text-xl font-semibold animate-pulse text-indigo-650">Loading profile...</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          {/* User Avatar */}
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg mx-auto mb-4 border-4 border-white dark:border-slate-800">
            {userProfile?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{userProfile?.name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{userProfile?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Developer API Key Panel */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <FiKey className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Developer REST API</h2>
              </div>
              <p className="text-xs text-slate-450 leading-relaxed mb-6">
                Use your API Key to programmatically upload and send documents using external endpoints.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="premium-label">REST API Key</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={userProfile?.apiKey ? (apiKeyCopied ? userProfile.apiKey : `${userProfile.apiKey.substring(0, 8)}••••••••••••••••••••`) : "No API Key active"}
                      className="premium-input text-xs pr-20 select-all font-mono"
                    />
                    {userProfile?.apiKey && (
                      <button
                        onClick={copyApiKey}
                        className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {apiKeyCopied ? <FiCheckCircle className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleGenerateApiKey}
                disabled={generatingKey}
                className="w-full premium-btn premium-btn-primary text-xs"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${generatingKey ? "animate-spin" : ""}`} />
                {userProfile?.apiKey ? "Regenerate API Key" : "Generate API Key"}
              </button>
            </div>
          </div>

          {/* Webhooks Config Panel */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <FiGlobe className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Global Webhooks</h2>
              </div>
              <p className="text-xs text-slate-450 leading-relaxed mb-6">
                Configure a URL to receive callback notifications for signing transitions on all documents.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="premium-label">Callback Target URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://api.yourwebsite.com/webhooks/signed"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="premium-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSaveWebhook}
                disabled={savingWebhook}
                className="w-full premium-btn premium-btn-primary text-xs"
              >
                Save Callback URL
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Profile;
