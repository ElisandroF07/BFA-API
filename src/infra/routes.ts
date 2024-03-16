import { type Request, type Response, Router } from "express";
import { uploadB2, uploadMulter } from "../middlewares/middleware";
import { TwoFactorAuthController } from "../modules/2fa/2fa.controller";
import { GenerateCredentialsController } from "../modules/generateCredentials/generateCredential.controller";
import { GetBICOntroller } from "../modules/getBI/getBI.controller";
import { LoginController } from "../modules/login/login.controller";
import { PersonalDataController } from "../modules/personal-data/personal-data.controller";
import { ResendEmailController } from "../modules/resend-email/resend-email.controller";
// import { ResetPasswordController } from "../modules/resetPassword/resetPassword.controller";
// import { SetAcessCodeController } from "../modules/setAccessCode/setAccessCode.controller";
import { Verify2FAController } from "../modules/verify-2fa/verify-2fa.controller";
import { VerifyEmailController } from "../modules/verify-email/verify-email.controller";
import { VerifyResetController } from "../modules/verify-reset/verify-reset.controller";
import { VerifyTokenController } from "../modules/verify-token/verify-token.controller";
import { GetUserDataController } from "../modules/getUserData/getUserData.controller";
import { GetAccountDataController } from "../modules/getAccountData/getAccountData.controller";
import { verifyToken } from "../middlewares/verifytoken.middleware";
import { GetCardDataController } from "../modules/getCardData/getCardData.controller";
import { SetCardNickname } from "../modules/setCardNickname/setCardNickname.usecase";
import { GetCardDataUseCase } from "../modules/getCardData/getCardData.usecase";
import { GetAccountDataUseCase } from "../modules/getAccountData/getAccountData.usecase";
import { GetUserDataUseCase } from "../modules/getUserData/getUserData.usecase";

const router = Router();

router.get("/", async (resquest: Request, response: Response) => {
	response.status(200).json({ message: "Server Running" });
});

router.post(
	"/upload/:email/:imageRole",
	uploadMulter,
	uploadB2,
	async (request: Request, response: Response) => {
		response.status(200).json({ message: "Imagem carregada com sucesso!" });
	},
);

router.post("/personal-data", async (request: Request, response: Response) => {
	new PersonalDataController().handle(request.body, response);
});

router.get("/getBI/:email", async (request: Request, response: Response) => {
	new GetBICOntroller().handle(request, response, request.body);
});

router.get(
	"/sendEmail/:email",
	async (request: Request, response: Response) => {
		new VerifyEmailController().handle(response, request);
	},
);

router.get(
	"/email/:email/verify/:token",
	async (request: Request, response: Response) => {
		new VerifyTokenController().handle(response, request);
	},
);

router.get(
	"/resendEmail/:email",
	async (request: Request, response: Response) => {
		new ResendEmailController().handle(response, request);
	},
);

router.get(
	"/generateCredentials/:email",
	async (request: Request, response: Response) => {
		new GenerateCredentialsController().handle(request, response);
	},
);

router.post("/login", async (request: Request, response: Response) => {
	new LoginController().handle(request.body, response);
});

router.get(
	"/2fa/:membership_number",
	async (request: Request, response: Response) => {
		new TwoFactorAuthController().handle(response, request);
	},
);

router.post(
	"/verifyOTP",
	async (request: Request, response: Response) => {
		new Verify2FAController().handle(response, request);
	},
);

// router.get(
// 	"/resetPassword/:email",
// 	async (request: Request, response: Response) => {
// 		new ResetPasswordController().handle(request, response);
// 	},
// );

// router.get(
// 	"/email/:email/resetPassword/:token",
// 	async (request: Request, response: Response) => {
// 		new VerifyResetController().handle(request, response);
// 	},
// );

// router.post("/setAccessCode", async (request: Request, response: Response) => {
// 	new SetAcessCodeController().handle(request.body, response);
// });

router.get("getUserData/:biNumber", async(request: Request, response: Response) => {
	new GetUserDataUseCase().execute(request, response)
})

router.get("/getAccountData/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new GetAccountDataUseCase().execute(request, response)
})

router.get("/getCardData/:biNumber", verifyToken, async(request: Request, response: Response) => {
	new GetCardDataUseCase().execute(request, response)
})

router.post("/setNickname", verifyToken, async(request: Request, response: Response) => {
	new SetCardNickname().execute(request, response)
})

export { router };
