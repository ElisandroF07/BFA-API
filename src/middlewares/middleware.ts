import B2 from "backblaze-b2";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { prismaClient } from "../infra/database/prismaClient";

// Configuração do multer para armazenar os arquivos em memória
export const uploadMulter = multer({ storage: multer.memoryStorage() }).any();

// Middleware para upload de arquivos para o Backblaze B2
export const uploadB2 = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Cria uma instância do cliente B2
	const b2 = new B2({
		applicationKeyId: process.env.KEY_ID || "",
		applicationKey: process.env.APP_KEY || "",
	});

	// Autoriza o cliente B2
	const authResponse = await b2.authorize();
	const { downloadUrl } = authResponse.data;

	// Obtém a URL de upload
	const response = await b2.getUploadUrl({
		bucketId: process.env.BUCKET_ID || "",
	});
	const { authorizationToken, uploadUrl } = response.data;

	// Encontra o cliente pelo email na base de dados
	const client = await prismaClient.client_email.findFirst({
		where: {
			email_address: req.params.email,
		},
		select: {
			client_id: true,
		},
		cacheStrategy: { ttl: 3600 }
	});

	// Configura os parâmetros para upload de cada tipo de imagem
	const params1 = {
		uploadUrl: uploadUrl,
		uploadAuthToken: authorizationToken,
		fileName: `clients_images/bi_front/BI_FRENTE_${client?.client_id}`,
		data: (req.files as Express.Multer.File[])[0].buffer,
	};
	const params2 = {
		uploadUrl: uploadUrl,
		uploadAuthToken: authorizationToken,
		fileName: `clients_images/bi_back/BI_VERSO_${client?.client_id}`,
		data: (req.files as Express.Multer.File[])[0].buffer,
	};
	const params3 = {
		uploadUrl: uploadUrl,
		uploadAuthToken: authorizationToken,
		fileName: `clients_images/selfies/SELFIE_${client?.client_id}`,
		data: (req.files as Express.Multer.File[])[0].buffer,
	};
	const params4 = {
		uploadUrl: uploadUrl,
		uploadAuthToken: authorizationToken,
		fileName: `clients_images/selfies_with_bi/SELFIE_BI_${client?.client_id}`,
		data: (req.files as Express.Multer.File[])[0].buffer,
	};
	const params5 = {
		uploadUrl: uploadUrl,
		uploadAuthToken: authorizationToken,
		fileName: `clients_images/profile_pictures/PROFILE_${client?.client_id}`,
		data: (req.files as Express.Multer.File[])[0].buffer,
	};

	// Realiza o upload baseado no tipo de imagem
	if (req.params.imageRole === "1") {
		const fileInfo = await b2.uploadFile(params1);
		// Salva informações do arquivo na resposta
		res.locals = fileInfo.data;
		// Cria um registro da imagem na base de dados
		await prismaClient.client_images.create({
			data: {
				image_role: 1,
				path: `${downloadUrl}/file/${process.env.BUCKET_NAME}/clients_images/bi_front/BI_FRENTE_${client?.client_id}`,
				client_id: client?.client_id,
			},
		});
	} else if (req.params.imageRole === "2") {
		const fileInfo = await b2.uploadFile(params2);
		res.locals = fileInfo.data;
		await prismaClient.client_images.create({
			data: {
				image_role: 2,
				path: `${downloadUrl}/file/${process.env.BUCKET_NAME}/clients_images/bi_back/BI_VERSO_${client?.client_id}`,
				client_id: client?.client_id,
			},
		});
	} else if (req.params.imageRole === "3") {
		const fileInfo = await b2.uploadFile(params3);
		res.locals = fileInfo.data;
		await prismaClient.client_images.create({
			data: {
				image_role: 3,
				path: `${downloadUrl}/file/${process.env.BUCKET_NAME}/clients_images/selfies/SELFIE_${client?.client_id}`,
				client_id: client?.client_id,
			},
		});
	} else if (req.params.imageRole === "4") {
		const fileInfo = await b2.uploadFile(params4);
		res.locals = fileInfo.data;
		await prismaClient.client_images.create({
			data: {
				image_role: 4,
				path: `${downloadUrl}/file/${process.env.BUCKET_NAME}/clients_images/selfies_with_bi/SELFIE_BI_${client?.client_id}`,
				client_id: client?.client_id,
			},
		});
	} else if (req.params.imageRole === "5") {
		const fileInfo = await b2.uploadFile(params5);
		res.locals = fileInfo.data;
		await prismaClient.client_images.create({
			data: {
				image_role: 5,
				path: `${downloadUrl}/file/${process.env.BUCKET_NAME}/clients_images/profile_pictures/PROFILE_${client?.client_id}`,
				client_id: client?.client_id,
			},
		});
	}

	next();
};
