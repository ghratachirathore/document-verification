import { Router } from "express";
import { listDocuments, replaceDocument, uploadDocument } from "../controllers/document.controller.js";
import { candidateOnly, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateDocumentUpload, validateResourceIdParam } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(verifyJWT, candidateOnly);
router.route("/").get(listDocuments);
router.route("/upload").post(upload.single("document"), validateDocumentUpload, uploadDocument);
router.route("/:id/replace").put(validateResourceIdParam("id"), upload.single("document"), validateDocumentUpload, replaceDocument);

export default router;
