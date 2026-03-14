import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

// Initialize the socket connection outside the component to avoid reconnects on re-render
const socket = io('http://localhost:3000')

const App = () => {
  const [userChats, setUserChats] = useState([])
  const [modelChats, setModelChats] = useState([])
  const [prompt, setPrompt] = useState("")
  const [isConnected, setIsConnected] = useState(socket.connected)

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
        {/* Header */}
        <div className='p-4 bg-zinc-800 rounded-t-md border-b border-zinc-700 flex items-center justify-between'>
          <h1 className='text-white text-xl font-semibold'>ChatBot</h1>
          <div className='flex items-center gap-2 text-xs text-zinc-300 font-medium tracking-wide'>
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        
        {/* Chat window */}
        <div className='flex-grow overflow-y-auto p-4 flex flex-col gap-3'>
          {userChats.map((chat, index) => (
            <React.Fragment key={index}>
              {/* User Message */}
              <div className='self-end bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md'>
                {chat}
              </div>
              
              {/* Model Message (rendered only if the response has arrived for this index) */}
              {modelChats[index] && (
                <div className='self-start bg-zinc-800 text-zinc-100 px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md'>
                  {modelChats[index]}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
       
       {/* Input Area */}
       <div className='p-3 flex gap-2 border-t border-zinc-800 bg-zinc-900 rounded-b-md'>
         <input 
           value={prompt}
           onChange={(e) => setPrompt(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
           placeholder='Type your Message' 
           className='flex-grow bg-zinc-800 border border-zinc-700 focus:border-blue-600 px-4 py-2 text-sm text-white placeholder-zinc-400 rounded-full outline-none transition-colors' 
           type="text" 
         />
         <button 
           onClick={sendMessage}
           className='px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-300 cursor-pointer text-white rounded-full font-medium'>
             Send
         </button>
       </div>
      </div>
    </div>
  )
}

export default App