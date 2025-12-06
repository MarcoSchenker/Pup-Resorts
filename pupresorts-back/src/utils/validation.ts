import { validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import {ValidationException} from "@src/utils/errors";

const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation: ValidationChain) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        else {
            throw ValidationException(errors.array());
        }
    };
};

export default validate;