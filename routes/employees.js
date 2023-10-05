import express from 'express';
import { DB } from '../models/Database.js'; // Certifique-se de que o caminho esteja correto
import multer from 'multer';
import path from 'path'

const router = express.Router();

// Configuração do armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Diretório onde as imagens serão armazenadas
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo no servidor
  },
});

const upload = multer({ storage: storage });

// Rota para fazer upload de uma imagem e criar um funcionário
// router.post('/', upload.single('image'), async (req, res) => {
//   try {
//     // O arquivo da imagem foi carregado com sucesso.
//     // O caminho da imagem está em req.file.path
//     const imagePath = req.file.path;
//     console.log(req)
//     console.log(req.file)

//     // Obtenha outros dados do corpo da solicitação
//     let employee = req.body;

//     // Adicione o campo "benefits" ao objeto employee
//     if (employee.benefits && Array.isArray(employee.benefits)) {
//       // Se "benefits" for uma matriz, una-a em uma string
//       employee.benefits = employee.benefits.join(', ');
//     }

//     // Adicione o caminho da imagem ao objeto employee
//     employee.employeePhoto = imagePath;

//     // Salve o funcionário no banco de dados
//     await DB.createEmployee(employee);

//     res.status(200).json({ message: 'Imagem carregada e registro de funcionário criado com sucesso' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Erro ao carregar a imagem ou criar o registro de funcionário' });
//   }
// });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Obtenha outros dados do corpo da solicitação
    let compleEmployee = {
        ...req.body,
        employeePhoto: req.file.filename
    }

    const benefits = req.body?.benefits
    if(Array.isArray(benefits)) {
      compleEmployee.benefits = benefits.join(', ')
    } else {
      compleEmployee.benefits = benefits ?? ''
    }

    // Salve o funcionário no banco de dados
    await DB.createEmployee(compleEmployee);

    // res.status(200).json({ message: 'Imagem carregada e registro de funcionário criado com sucesso' });
    res.status(200).json({ message: `Funcionário registrado com sucesso!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar a imagem ou criar o registro de funcionário' });
  }
});

// router.use('/uploads', express.static('./uploads'))
router.get('/photo/:employeePhotoName', (req, res) => {
  const photoName = req.params.employeePhotoName
  const completePath = path.resolve(path.join('./uploads', photoName))

  res.sendFile(completePath)
})

// Restante das rotas para listar e atualizar funcionários
router.get('/', async (req, res) => {
  const employees = await DB.listEmployees();

  res.status(200).json(employees);
});

router.get('/:id', async (req, res) => {
  const employee = await DB.getEmployee(req.params.id);

  res.status(200).json(employee)
})

router.put('/:id', async (req, res) => {
  const employeeId = req.params.id;
  const newData = req.body;

  await DB.updateEmployee(employeeId, newData);

  res.status(200).json({ message: 'Funcionário atualizado com sucesso' });
});

export default router;
