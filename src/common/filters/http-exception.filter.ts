import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException
            ? exception.getResponse()
            : 'Something went wrong!';

        const errorResponse = {
            success: false,
            statusCode: status,
            message: this.normalizeMessage(message)
        };

        console.log(exception);
        response.status(status).json(errorResponse);
    }

    private normalizeMessage(message: string | object): string[] {
        if(typeof message === 'string'){
            return [message];
        }

        if(typeof message === 'object' && message !== null){
            const res: any = message as any;

            if(typeof res.message === 'string'){
                return [res.message];
            }
            if(Array.isArray(res.message)){
                return res.message;
            }
        }

        return ['Unexcepted error occurred'];
    }
}