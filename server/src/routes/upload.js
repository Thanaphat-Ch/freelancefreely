// routes/upload.js
router.post(
  "/resume",
  auth,
  upload.single("file"),
  (req, res) => {
    res.json({
      url: req.file.path,          
      public_id: req.file.filename 
    })
  }
)
