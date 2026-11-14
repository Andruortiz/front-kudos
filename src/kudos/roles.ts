import type { Role } from '../api/types'

const LABELS: Record<Role, string> = {
  ADMINISTRATOR: 'Administrador',
  RECTOR: 'Rector',
  ACADEMIC_COORDINATOR: 'Coordinador académico',
  FACULTY_COORDINATOR: 'Decano',
  PROGRAM_COORDINATOR: 'Coordinador de programa',
  TEACHER: 'Docente',
  STUDENT: 'Estudiante',
}

export function roleLabel(role: Role): string {
  return LABELS[role]
}
