import os
import sys

from . import api, web

sys.path.append(os.path.abspath(os.path.dirname(__file__)))


def response_form(description, detail='', **kwargs):
    return {
        'description': description,
        'content': {
            'application/json': {
                'example': {
                    'detail': detail if detail else description,
                }
            }
        },
        **kwargs
    }


def response_schema(*exceptions, **kwargs):
    return {
        **kwargs,
        **{exception.status_code: response_form(**exception.detail) if isinstance(exception.detail, dict)
        else response_form(exception.detail) for exception in exceptions}}

