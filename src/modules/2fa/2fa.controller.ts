import { Request, Response } from "express";
import { TwoFactorAuthUseCase } from "./2fa.usecase";

export class TwoFactorAuthController {
	handle(response: Response, request: Request) {
		const useCase = new TwoFactorAuthUseCase();
		useCase.execute(response, request);
	}
}
