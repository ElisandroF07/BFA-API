const multer  = require('multer')

const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, 'src/uploads')
    },
    filename: function (req: any, file: any, cb: any) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${file.fieldname}_${uniqueSuffix}_${file.originalname}`)
    }
  })
  
export const upload = multer({ storage: storage })