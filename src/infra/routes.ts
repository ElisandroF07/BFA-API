//importação dos módulos necessários para o funcionamento das rotas
import { Request, Response, Router } from "express";
import { uploadB2, uploadMulter } from "../middlewares/middleware";
import { GenerateCredentialsController } from "../modules/generateCredentials/generateCredential.controller";
import { GetBICOntroller } from "../modules/getBI/getBI.controller";
import { PersonalDataController } from "../modules/personal-data/personal-data.controller";
import { ResendEmailController } from "../modules/resend-email/resend-email.controller";
import { Verify2FAController } from "../modules/verify-2fa/verify-2fa.controller";
import { VerifyEmailController } from "../modules/verify-email/verify-email.controller";
import { VerifyTokenController } from "../modules/verify-token/verify-token.controller";
import { verifyToken } from "../middlewares/verifytoken.middleware";
import { SetCardNickname } from "../modules/setCardNickname/setCardNickname.usecase";
import { GetCardDataUseCase } from "../modules/getCardData/getCardData.usecase";
import { GetAccountDataUseCase } from "../modules/getAccountData/getAccountData.usecase";
import { GetUserDataUseCase } from "../modules/getUserData/getUserData.usecase";
import { GetProfilePictureUseCase } from "../modules/getProfilePicture/getProfilePicture.usecase";
import { GetAuthTokenUseCase } from "../modules/getAuthToken/getAuthToken.usecase";
import { SetAccessCodeUseCase } from "../modules/setAccessCode/setAcessCode.usecase";
import { GetFirstLoginUseCase } from "../modules/getFirstLogin/GetFirstLogin.usecase";
import { ResetPasswordController } from "../modules/resetPassword/resetPassword.controller";
import { VerifyResetController } from "../modules/verify-reset/verify-reset.controller";
import { ResetAccessCodeUseCase } from "../modules/resetAcessCode/resetAccessCode.usecase";
import { PrivateResetAccessCodeUseCase } from "../privateModules/privateResetAcessCode/privateResetAccessCode.usecase";
import { CheckAccessCode } from "../privateModules/checkAccessCode/checkAccessCode.usecase";
import { GetAccountByNumber } from "../privateModules/getAccountByNumber/getAccountByNumber.usecase";
import { GetAccountByIban } from "../privateModules/getAccountByIban/getAccountByIban.usecase";
import { PrivateTwoFactorAuthUseCase } from "../privateModules/private2fa/private2fa.usecase";
import { Check2FA } from "../privateModules/check2FA/check2FA.usecase";
import { SetEmailUseCase } from "../privateModules/setEmail/setEmail.usecase";
import { TransferInterbancUseCase } from "../privateModules/transferences/interbanc.usecase";
import { TransferIntrabancUseCase } from "../privateModules/transferences/intrabanc.usecase";
import { GetTransactionsUseCase } from "../privateModules/getTransactions/getTransactions.usecase";
import { GetTransactionUseCase } from "../privateModules/getTransaction/getTransaction.usecase";
import { FindFriendUseCase } from "../privateModules/friends/findFriend.usecase";
import { AddFriendUseCase } from "../privateModules/friends/addFriend.usecase";
import { RemoveFriendUseCase } from "../privateModules/friends/removeFriend.usecase";
import { GetFriendsUseCase } from "../privateModules/friends/getFriends.usecase";
import { SendMoneyUseCase } from "../privateModules/friends/sendMoney.usecase";
import { NeedMoneyUseCase } from "../privateModules/friends/needMoney.usecase";
import { AcceptMoneyRequestUseCase } from "../privateModules/friends/acceptMoneyRequest.usecase";
import { RejectMoneyRequestUseCase } from "../privateModules/friends/rejectMoneyRequest.usecase copy";
import { CreateNotificationUseCase } from "../privateModules/notifications/createNotification.usecase";
import { GetNotificationsUseCase } from "../privateModules/notifications/getNotifications";
import { GetMoneyRequestUseCase } from "../privateModules/friends/getMoneyRequest";
import { DeleteNotificationUseCase } from "../privateModules/notifications/deleteNotification.usecase";
import { CreateUpmoneyUseCase } from "../privateModules/upmoney/createUpmoney.usecase";
import { CancelUpmoneyUseCase } from "../privateModules/upmoney/cancelUpmoney.usecase";
import { GetSendedTransfersUseCase } from "../privateModules/transferences/getSendedTrasfeers.usecase copy";
import { GetReceivedTransfersUseCase } from "../privateModules/transferences/getReceivedTrasfeers.usecase";
import { LoginUseCase } from "../modules/login/login.usecase";
import { TwoFactorAuthUseCase } from "../modules/2fa/2fa.usecase";
import { Verify2FAUseCase } from "../modules/verify-2fa/verify-2fa.usecase";
import { GetBINumberUseCase } from "../privateModules/getBiNumber/getBiNumber.usecase";
import { GetTransactionReceptorUseCase } from "../privateModules/getTransaction/getTransactionReceptor.usecase";
import { GetUpMoneysUseCase } from "../privateModules/upmoney/getUpmoneys";
import { GetUpMoneyUseCase } from "../privateModules/upmoney/getUpmoney";
import { CreateEntityUseCase } from "../modules/entity/createEntity.usecase";
import { GetEntitiesUseCase } from "../modules/entity/getEntities.usecase";
import { GenerateCredentialsUseCase } from "../modules/generateCredentials/generateCredential.usecase";
import { SendOTPUseCase } from "../privateModules/sendOTP/sendOTP.usecase";
import { PayUseCase } from "../modules/entity/pay.usecase";
import { generatePDF } from "../modules/pdf/generatePDF.usecase";

// Inicializando o router do Express
const router = Router();

// Rota principal para verificar se o servidor está rodando
router.get("/", async (resquest: Request, response: Response) => {
	response.status(200).json({ message: "Server Running" });
});

// Rota para upload de imagens
router.post(
	"/upload/:email/:imageRole",
	uploadMulter,
	uploadB2,
	async (request: Request, response: Response) => {
		response.status(200).json({ message: "Imagem carregada com sucesso!" });
	},
);

// Rotas para manipulação de dados pessoais
router.post("/personal-data", async (request: Request, response: Response) => {
	new PersonalDataController().handle(request.body, response);
});

// Rota para obter dados de um BI
router.get("/getBI/:email", async (request: Request, response: Response) => {
	new GetBICOntroller().handle(request, response, request.body);
});

// Rota para enviar e-mail de verificação
router.get(
	"/sendEmail/:email",
	async (request: Request, response: Response) => {
		new VerifyEmailController().handle(response, request);
	},
);

// Rota para verificar token de e-mail
router.get(
	"/email/:email/verify/:token",
	async (request: Request, response: Response) => {
		new VerifyTokenController().handle(response, request);
	},
);

// Rota para reenviar e-mail de verificação
router.get(
	"/resendEmail/:email",
	async (request: Request, response: Response) => {
		new ResendEmailController().handle(response, request);
	},
);

// Rota para gerar credenciais de acesso
router.get(
	"/generateCredentials/:email/:accountType/:area/:local",
	async (request: Request, response: Response) => {
		new GenerateCredentialsUseCase().execute(request, response);
	},
);

// Rota para realizar login
router.post("/login", async (request: Request, response: Response) => {
	new LoginUseCase().execute(request.body, response);
});

// Rota para autenticação de dois fatores
router.get(
	"/2fa/:membership_number",
	async (request: Request, response: Response) => {
		new TwoFactorAuthUseCase().execute(response, request);
	},
);

// Rota para verificar token de dois fatores
router.post("/verifyOTP", async (request: Request, response: Response) => {
		new Verify2FAUseCase().execute(response, request);
	}
);

// Rota para redefinir senha
router.get(
	"/resetPassword/:email",
	async (request: Request, response: Response) => {
		new ResetPasswordController().handle(request, response);
	},
);

// Rota para verificar token de redefinição de senha
router.get(
	"/email/:email/resetPassword/:token",
	async (request: Request, response: Response) => {
		new VerifyResetController().handle(request, response);
	},
);

// Rota para definir código de acesso
router.post("/setAccessCode", async (request: Request, response: Response) => {
	new ResetAccessCodeUseCase().execute(request, response);
});

// Rota para obter dados do usuário
router.get("/getUserData/:biNumber", async(request: Request, response: Response) => {
	new GetUserDataUseCase().execute(request, response)
})

// Rota para obter dados da conta
router.get("/getAccountData/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new GetAccountDataUseCase().execute(request, response)
})

// Rota para obter dados do cartão
router.get("/getCardData/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new GetCardDataUseCase().execute(request, response)
})

// Rota para definir apelido do cartão
router.post("/setNickname", verifyToken, async(request: Request, response: Response) => {
	new SetCardNickname().execute(request, response)
})

// Rota para obter token de autenticação
router.get("/getAuthToken", async(request: Request, response: Response) => {
	new GetAuthTokenUseCase().execute(request, response)
})

// Rota para obter imagem de perfil
router.get("/getProfilePicture/:biNumber", async(request: Request, response: Response) => {
	new GetProfilePictureUseCase().execute(request, response)
})

// Rota para definir e-mail
router.post("/setEmail", verifyToken, async(request: Request, response: Response) => {
	new SetEmailUseCase().execute(request, response)
})

// Rota para verificar primeiro login
router.get("/verifyLogin/:email", verifyToken, async(request: Request, response: Response) => {
	new GetFirstLoginUseCase().execute(request, response)
})

// Rota para redefinir código de acesso privado
router.post("/privateResetAccessCode", verifyToken, async(request: Request, response: Response) => {
	new PrivateResetAccessCodeUseCase().execute(request, response);
})

// Rota para verificar código de acesso privado
router.post("/checkAccessCode", verifyToken, async(request: Request, response: Response) => {
	new CheckAccessCode().execute(request, response);
})

// Rota para obter conta por número
router.get("/getAccountByNumber/:accountNumber", verifyToken, async(request: Request, response: Response) => {
	new GetAccountByNumber().execute(request, response);
})

// Rota para obter conta por IBAN
router.get("/getAccountByIban/:accountIban", verifyToken, async(request: Request, response: Response) => {
	new GetAccountByIban().execute(request, response);
})

// Rota para autenticação de dois fatores privada
router.get("/private2fa/:email/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new PrivateTwoFactorAuthUseCase().execute(request, response);
})

// Rota para verificar dois fatores privada
router.get("/check2FA/:otp/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new Check2FA().execute(request, response);
})

// Rota para transferência interbancária
router.post("/transferInterbanc", verifyToken, async(request: Request, response: Response) => {
	new TransferInterbancUseCase().execute(request, response);
})

// Rota para transferência intrabancária
router.post("/transferIntrabanc", verifyToken, async(request: Request, response: Response) => {
	new TransferIntrabancUseCase().execute(request, response);
})

// Rota para obter transações
router.get("/getTransactions/:accountNumber", verifyToken, async(request: Request, response: Response) => {
	new GetTransactionsUseCase().execute(request, response);
})

// Rota para obter transação
router.get("/getTransaction/:transactionId", verifyToken, async(request: Request, response: Response) => {
	new GetTransactionUseCase().execute(request, response);
})

router.get("/getTransactionReceptor/:transactionId", verifyToken, async(request: Request, response: Response) => {
	new GetTransactionReceptorUseCase().execute(request, response);
})

// Rota para encontrar amigo
router.get("/findFriend/:email/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new FindFriendUseCase().execute(request, response);
})

// Rota para adicionar amigo
router.post("/addFriend", verifyToken, async(request: Request, response: Response) => {
	new AddFriendUseCase().execute(request, response);
})

// Rota para remover amigo
router.get("/removeFriend/:id", verifyToken, async(request: Request, response: Response) => {
	new RemoveFriendUseCase().execute(request, response);
})

// Rota para obter amigos
router.get("/getFriends/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new GetFriendsUseCase().execute(request, response);
})

// Rota para enviar dinheiro
router.post("/sendMoney", verifyToken, async(request: Request, response: Response) => {
	new SendMoneyUseCase().execute(request, response);
})

// Rota para solicitar dinheiro
router.post("/requestMoney", verifyToken, async(request: Request, response: Response) => {
	new NeedMoneyUseCase().execute(request, response);
})

// Rota para aceitar solicitação de dinheiro
router.get("/acceptMoneyRequest/:id/:notificationId", async(request: Request, response: Response) => {
	new AcceptMoneyRequestUseCase().execute(request, response);
})

// Rota para rejeitar solicitação de dinheiro
router.get("/rejectMoneyRequest/:id/:notificationId", verifyToken, async(request: Request, response: Response) => {
	new RejectMoneyRequestUseCase().execute(request, response);
})

// Rota para criar notificação
router.post("/createNotification", async(request: Request, response: Response) => {
	new CreateNotificationUseCase().execute(request, response);
})

// Rota para obter notificações
router.get("/getNotifications/:email", verifyToken, async(request: Request, response: Response) => {
	new GetNotificationsUseCase().execute(request, response);
})

// Rota para obter solicitações de dinheiro
router.get("/getMoneyRequest/:email", verifyToken, async(request: Request, response: Response) => {
	new GetMoneyRequestUseCase().execute(request, response);
})

// Rota para deletar notificação
router.get("/deleteNotification/:id", verifyToken, async(request: Request, response: Response) => {
	new DeleteNotificationUseCase().execute(request, response);
})

// Rota para criar levantamento sem cartão
router.post("/createUpmoney", verifyToken, async(request: Request, response: Response) => {
	new CreateUpmoneyUseCase().execute(request, response);
})

// Rota para cancelar levantamento sem cartão
router.put("/cancelUpmoney/:transactionId", verifyToken, async(request: Request, response: Response) => {
	new CancelUpmoneyUseCase().execute(request, response);
})

router.get("/getSendedTransfers/:accountNumber", verifyToken, async(request: Request, response: Response) => {
	new GetSendedTransfersUseCase().execute(request, response);
})

router.get("/getReceivedTransfers/:accountNumber/:accountIban", verifyToken, async(request: Request, response: Response) => {
	new GetReceivedTransfersUseCase().execute(request, response);
})

router.get("/getBiNumber/:email", verifyToken, async(request: Request, response: Response) => {
	new GetBINumberUseCase().execute(request, response);
})

router.get("/getUpmoneys/:accountNumber", verifyToken, async(request: Request, response: Response) => {
	new GetUpMoneysUseCase().execute(request, response);
})

router.get("/getUpmoney/:id", verifyToken, async(request: Request, response: Response) => {
	new GetUpMoneyUseCase().execute(request, response);
})

router.post("/createEntity", async(request: Request, response: Response) => {
	new CreateEntityUseCase().execute(request, response);
})

router.get("/getEntities", verifyToken, async(request: Request, response: Response) => {
	new GetEntitiesUseCase().execute(request, response);
})
router.post("/sendOTP/:email/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new SendOTPUseCase().execute(request, response);
})

router.post("/pay", verifyToken, async(request: Request, response: Response) => {
	new PayUseCase().execute(request, response);
})

router.get("/generatePDF/:type/:transactionId", async(request: Request, response: Response) => {
	new generatePDF().execute(request, response);
})

// Exportando o router
export { router };
