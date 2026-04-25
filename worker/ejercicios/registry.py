'''
Define un decorador para registrar cada ejercicio automaticamente
Evita el uso de condicionales repetitivovs para la seleccion del ejercicio

Uso:
1.
@register
class Ejercicio(BaseExercise):

2.
Incluir import del ejercicio en __init__.py
( No pueden estar los imports aqui pq generaria un error por bucle de imports )
'''

EXERCISES = {}

def register(cls):
    EXERCISES[cls.name] = cls
    return cls

def get_exercise(name: str):
    if name not in EXERCISES:
        raise ValueError(f"Ejercicio '{name}' no registrado")
    return EXERCISES[name]()