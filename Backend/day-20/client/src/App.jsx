import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Initialize the socket connection outside the component to avoid reconnects on re-render
const socket = io('http://localhost:3000')

const ChatHeader = ({ isConnected }) => (
  <div className='p-4 bg-zinc-800 rounded-t-md border-b border-zinc-700 flex items-center justify-between'>
    <h1 className='text-white text-xl font-semibold'>ChatBot</h1>
    <div className='flex items-center gap-2 text-xs text-zinc-300 font-medium tracking-wide'>
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  </div>
)

const UserMessage = ({ text }) => (
  <div className='self-end bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md whitespace-pre-wrap'>
    {text}
  </div>
)

const ModelMessage = ({ text }) => (
  <div className='self-start bg-zinc-800 text-zinc-100 px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md'>
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, '')} style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-md text-sm my-2" />
          ) : (
            <code {...props} className="bg-zinc-700 text-pink-300 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          )
        }
      }}
    >
      {text}
    </ReactMarkdown>
  </div>
)

const ChatInput = ({ prompt, setPrompt, sendMessage }) => (
  <div className='p-3 flex gap-2 border-t border-zinc-800 bg-zinc-900 rounded-b-md'>
    <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && prompt.trim() !== '' && sendMessage()} placeholder='Type your Message' className='flex-grow bg-zinc-800 border border-zinc-700 focus:border-blue-600 px-4 py-2 text-sm text-white placeholder-zinc-400 rounded-full outline-none transition-colors' type="text" />
    <button onClick={sendMessage} disabled={!prompt.trim()} className='px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-300 cursor-pointer text-white rounded-full font-medium'>
      Send
    </button>
  </div>
)

const App = () => {
  const [userChats, setUserChats] = useState([])
  const [modelChats, setModelChats] = useState([])
  const [prompt, setPrompt] = useState("")
  const [isConnected, setIsConnected] = useState(socket.connected)
  const chatEndRef = useRef(null)

  useEffect(() => {
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // Listen for AI responses coming from the backend
    socket.on("ai-message", (response) => {
      setModelChats((prevChats) => [...prevChats, response])
    })

    // Cleanup the event listener on component unmount
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("ai-message")
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [userChats, modelChats])

  const sendMessage = () => {
    if (prompt.trim() !== "") {
      // Add the user's message to the userChats state
      setUserChats((prevChats) => [...prevChats, prompt])
      // Emit the message to the backend
      socket.emit("message", { prompt })
      // Clear the input
      setPrompt("")
    }
  }

  return (
    <div className='bg-black h-[100vh] flex items-center justify-center w-full text-white'>
      <div className='bg-zinc-900 border border-zinc-800 h-[80vh] w-96 rounded-md flex flex-col shadow-2xl'>
        <ChatHeader isConnected={isConnected} />
        
        <div className='flex-grow overflow-y-auto p-4 flex flex-col gap-3'>
          {userChats.map((chat, index) => (
            <React.Fragment key={index}>
              <UserMessage text={chat} />
              {modelChats[index] && <ModelMessage text={modelChats[index]} />}
            </React.Fragment>
          ))}
          <div ref={chatEndRef} />
        </div>
       
        <ChatInput prompt={prompt} setPrompt={setPrompt} sendMessage={sendMessage} />
      </div>
    </div>
  )
}

export default App