export default function ContactoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">📞 Contacto y Pedidos</h1>
      <p className="text-gray-600 mb-6">¿Tienes dudas o quieres realizar un pedido grande? Déjanos un mensaje.</p>
      
      <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input type="text" placeholder="Tu nombre" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje o Pedido</label>
          <textarea rows={4} placeholder="Escribe los detalles aquí..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
        </div>
        
        <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm">
          Enviar Mensaje
        </button>
      </form>
    </div>
  );
}