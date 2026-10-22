export function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Nenhum arquivo enviado.",
    });
  }

  return res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
  });
}
