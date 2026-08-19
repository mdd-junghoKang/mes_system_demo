from fastapi import HTTPException

from domain.status import api


class Base(HTTPException):
    status_code = api.NOT_FOUND
    detail = 'Unknown Exception'
    headers = {}

    def __init__(self, *args, **kwargs):
        if args or kwargs:
            super().__init__(*args, **kwargs)
        else:
            super().__init__(status_code=self.status_code, detail=self.detail, headers=self.headers)


class NotFoundUser(Base):
    status_code = api.NOT_FOUND
    detail = 'Not Found User'


class BadRequestParameter(Base):
    status_code = api.BAD_REQUEST
    detail = 'Bad Request Parameter'


class AlreadyExistsUser(Base):
    status_code = api.CONFLICT
    detail = 'Already Exists User'


class AlreadyExistsEmail(Base):
    status_code = api.CONFLICT
    detail = 'Already Exists Email'


class FailedCredential(Base):
    status_code = api.UNAUTHORIZED
    detail = 'Could Not Validate Credentials'


class ForbiddenAccess(Base):
    status_code = api.FORBIDDEN
    detail = 'Forbidden Access'


class InvalidHost(Base):
    status_code = api.UNAUTHORIZED
    detail = 'Invalid Host'


class InvalidHeaders(Base):
    status_code = api.BAD_REQUEST
    detail = 'Invalid Headers'


class InvalidInputData(Base):
    status_code = api.UNAUTHORIZED
    detail = 'Invalid Input Data'


class RequestTimeout(Base):
    status_code = api.REQUEST_TIMEOUT
    detail = 'Request Timeout'


class InternalServerError(Base):
    status_code = api.INTERNAL_SERVER_ERROR
    detail = 'Internal Server Error'


class ServiceUnavailable(Base):
    status_code = api.SERVICE_UNAVAILABLE
    detail = 'Service Unavailable'
