import axios from "axios";
import { Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class PersonalDataUseCase {
	formatName(name: string[]) {
		return name.join(" ").toUpperCase().trim().replace(/\s/g, "");
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async uploadData(data: any, response: Response) {
		const { email, name, birthDate, biNumber } = data;
		const body = JSON.stringify({
			affairsReceipt: biNumber,
			affairsType: "IDCard",
			captchaValue: "",
		});

		try {
			const [res, res2] = await Promise.all([
				axios.post(
					"https://bi-bs.minjusdh.gov.ao/pims-backend/api/v1/progress",
					body,
					{ headers: { "Content-Type": "application/json" } },
				),
				axios.get(
					`https://bi.minjusdh.gov.ao/api/identityLostService/identitycardlost/queryRegisterInfo/${biNumber}`,
				),
			]);

			if (res.data.affairsProgressState === "Activate") {
				if (res2.data.data.ID_NUMBER) {
					let bi_name = `${res2.data.data.FIRST_NAME} ${res2.data.data.LAST_NAME}`;
					bi_name = bi_name.trim().replace(/\s/g, "");
					if (bi_name === this.formatName(name)) {
						const test = await prismaClient.client.findFirst({
							where: { bi_number: biNumber },
							select: { client_id: true },
						});
						const client = await prismaClient.client.upsert({
							where: { client_id: test?.client_id || 0 },
							create: {
								personal_data: {
									name: name,
									gender:
										res2.data.data.GENDER === "1" ? "Masculino" : "Feminino",
									birthDate: birthDate,
								},
								bi_number: biNumber,
								role_id: 1,
								address: {
									country: "Angola",
									full_address: res2.data.data.ADDRESS,
								},
							},
							update: {
								personal_data: {
									name: name,
									gender:
										res2.data.data.GENDER === "1" ? "Masculino" : "Feminino",
									birthDate: birthDate,
								},
							},
						});
						const client_email = await prismaClient.client_email.findFirst({
							where: { email_address: email },
							select: { email_id: true },
						});
						await prismaClient.client_email.update({
							where: { email_id: client_email?.email_id },
							data: {
								client_id: client.client_id,
							},
						});
						return response
							.status(201)
							.json({ message: "Informações adicionadas com sucesso!" });
					}

					return response
						.status(200)
						.json({ message: "Introduza o nome conforme consta no seu BI!" });
				}

				const test = await prismaClient.client.findFirst({
					where: { bi_number: biNumber },
					select: { client_id: true },
				});
				const client = await prismaClient.client.upsert({
					where: { client_id: test?.client_id },
					create: {
						personal_data: {
							name: name,
							birthDate: birthDate,
						},
						bi_number: biNumber,
						role_id: 1,
						address: {
							country: "Angola",
						},
					},
					update: {
						personal_data: {
							name: name,
							birthDate: birthDate,
						},
					},
				});
				const client_email = await prismaClient.client_email.findFirst({
					where: { email_address: email },
					select: { email_id: true },
				});
				await prismaClient.client_email.update({
					where: { email_id: client_email?.email_id },
					data: {
						client_id: client.client_id,
					},
				});
				return response
					.status(201)
					.json({ message: "Informações adicionadas com sucesso!" });
			}

			return response.status(200).json({
				message: "BI não cadastrado nos serviços de identificação do MINJUD!",
			});
		} catch (error) {
			console.error(error);
			return response
				.status(500)
				.json({ message: "Ocorreu um erro ao processar a solicitação." });
		}
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	execute(data: any, response: Response) {
		this.uploadData(data, response);
	}
}
