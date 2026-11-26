// Controller de autenticacion: solo traduce HTTP <-> caso de uso
// Express 5 pasa automaticamente al manejador de errores lo que tire una funcion async
const crearAuthController = ({ authUseCase }) => {
  const registrar = async (req, res) => {
    const usuario = await authUseCase.registrar(req.body)
    res.status(201).json(usuario)
  }

  const iniciarSesion = async (req, res) => {
    const resultado = await authUseCase.iniciarSesion(req.body)
    res.status(200).json(resultado)
  }

  const perfil = async (req, res) => {
    const usuario = await authUseCase.obtenerPerfil(req.usuario.id)
    res.status(200).json(usuario)
  }

  return { registrar, iniciarSesion, perfil }
}

module.exports = crearAuthController
