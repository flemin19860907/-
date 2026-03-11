import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateContent, getHotNews } from './services/ai';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Platform = 'wechat' | 'xiaohongshu' | 'weibo';

interface GeneratedData {
  wechat: string;
  xiaohongshu: string;
  weibo: string;
}

interface HotNewsItem {
  title: string;
  summary: string;
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform>('wechat');
  const [error, setError] = useState<string | null>(null);

  const [hotNews, setHotNews] = useState<HotNewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  useEffect(() => {
    fetchHotNews();
  }, []);

  const fetchHotNews = async () => {
    setIsLoadingNews(true);
    setError(null);
    try {
      const news = await getHotNews();
      setHotNews(news);
    } catch (err: any) {
      setError(err.message || '获取热门新闻失败');
    } finally {
      setIsLoadingNews(false);
    }
  };

  const handleGenerate = async (targetTopic: string = topic) => {
    if (!targetTopic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);
    
    try {
      const textResult = await generateContent(targetTopic);
      setGeneratedData(textResult);
    } catch (err: any) {
      setError(err.message || '生成内容失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewsClick = (newsTopic: string) => {
    setTopic(newsTopic);
    handleGenerate(newsTopic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="font-serif text-xl font-bold tracking-wider flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          INK & IDEA.
        </div>
        <div className="text-xs font-medium tracking-widest uppercase text-stone-400">
          Multi-Platform Copywriter
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {/* Hero Section */}
        <div className="py-16 md:py-24 text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-semibold tracking-tight text-stone-900"
          >
            今天想写点什么？
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-stone-500 text-lg max-w-xl mx-auto"
          >
            输入主题或选择今日热点，AI 自动为您生成微信公众号、小红书、微博专属文案。
          </motion.p>
        </div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative flex items-center bg-white rounded-full shadow-sm border border-stone-200 p-2 transition-shadow focus-within:shadow-md focus-within:border-stone-300">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：2026年春季极简穿搭指南..."
              className="flex-1 bg-transparent px-6 py-4 text-lg outline-none placeholder:text-stone-300"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !topic.trim()}
              className="bg-stone-900 text-white rounded-full px-8 py-4 font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : '生成'}
            </button>
          </div>
          
          {error && (
            <div className="absolute -bottom-16 left-0 right-0 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm shadow-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </motion.div>

        {/* Hot News Section */}
        {!generatedData && !isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-24 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 text-stone-400 mb-8 justify-center">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium tracking-widest uppercase">今日热点</span>
            </div>
            
            {isLoadingNews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 animate-pulse">
                    <div className="h-5 bg-stone-100 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-50 rounded w-full"></div>
                      <div className="h-3 bg-stone-50 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotNews.map((news, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNewsClick(news.title)}
                    className="group text-left p-6 bg-white rounded-2xl border border-stone-200 hover:border-stone-900 transition-colors shadow-sm hover:shadow"
                  >
                    <h3 className="font-serif font-semibold text-stone-900 mb-3 line-clamp-2 group-hover:underline decoration-1 underline-offset-4 leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">
                      {news.summary}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {(isGenerating || generatedData) && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16"
            >
              {/* Tabs */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-stone-200/50 p-1 rounded-full">
                  {(['wechat', 'xiaohongshu', 'weibo'] as Platform[]).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      className={cn(
                        "px-8 py-2.5 rounded-full text-sm font-medium transition-all",
                        activePlatform === platform
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700"
                      )}
                    >
                      {platform === 'wechat' && '微信公众号'}
                      {platform === 'xiaohongshu' && '小红书'}
                      {platform === 'weibo' && '微博'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200 min-h-[400px]">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4 py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
                    <p className="font-serif italic text-lg">正在为您精心撰写文案...</p>
                  </div>
                ) : generatedData ? (
                  <div className="prose prose-stone max-w-none prose-headings:font-serif prose-p:leading-loose prose-p:text-stone-600 prose-a:text-stone-900">
                    <Markdown>{generatedData[activePlatform]}</Markdown>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
