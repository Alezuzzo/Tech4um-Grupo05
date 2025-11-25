const Home = () => {
    return (
        <div className="w-full mx-auto flex flex-col gap-8 mt-15">
            <section className="flex flex-col gap-1.5">
                <h1 className="text-3xl text-gray-500 font-light">Opa!</h1>
                <p className="text-xl text-gray-500 font-bold">Sobre oque gostaria de falar hoje?</p>
            </section>
            <div className="flex gap-5">
                <div className="flex flex-1 border border-[#0078D4] rounded-lg justify-between items-center">
                    <input className="px-4 py-3 focus:outline-none text-sm placeholder-gray-400 w-full" type="text" placeholder="Em busca de uma sala? Encontre-a aqui"/>
                    <button className='bg-[#0078D4] text-white font-bold px-4 rounded-lg transition-colors h-full shadow-md hover:bg-[#0060AA]'>→</button>
                </div>
                <button className='bg-[#0078D4] text-white px-3 rounded-lg transition-colors w-fit shadow-md hover:bg-[#0060AA] font-medium'>Ou crie seu próprio 4um</button>
            </div>
        </div>
    )
}

export default Home;