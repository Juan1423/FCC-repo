// src/docs/swagger.definitions.js

const swaggerDefinitions = {
  openapi: "3.0.0",
  info: {
    title: "API Fundación con Cristo",
    version: "1.0.0",
    description:
      "Documentación completa de la API para el sistema de la Fundación con Cristo",
  },
  tags: [
    {
      name: "Atención",
      description: "Operaciones relacionadas con atenciones médicas",
    },
    {
      name: "Auditorias",
      description: "Operaciones relacionadas con el registro de auditorías",
    },
    {
      name: "Diagnósticos",
      description: "Operaciones relacionadas con diagnósticos médicos",
    },
    {
      name: "Enfermedades",
      description: "Operaciones relacionadas con enfermedades",
    },
    {
      name: "Especialidades",
      description: "Operaciones relacionadas con especialidades médicas",
    },
    {
      name: "Exámenes",
      description: "Operaciones relacionadas con exámenes médicos",
    },
    {
      name: "Historia Clínica",
      description: "Operaciones relacionadas con historias clínicas",
    },
    {
      name: "Pacientes",
      description: "Operaciones relacionadas con pacientes",
    },
    {
      name: "Personal de Salud",
      description: "Operaciones relacionadas con personal de salud",
    },
    {
      name: "Signos Vitales",
      description: "Operaciones relacionadas con signos vitales",
    },
    { name: "Terapias", description: "Operaciones relacionadas con terapias" },
    {
      name: "Tipos de Especialidad",
      description: "Operaciones relacionadas con tipos de especialidad",
    },
    {
      name: "Tipos de Terapia",
      description: "Operaciones relacionadas con tipos de terapia",
    },
    {
      name: "Usuarios",
      description: "Operaciones relacionadas con usuarios del sistema",
    },
    {
      name: "Cantones",
      description: "Operaciones relacionadas con los cantones",
    },
    {
      name: "Interacciones",
      description: "Operaciones relacionadas con las interacciones",
    },
    {
      name: "Parroquias",
      description: "Operaciones relacionadas con las parroquias",
    },
    {
      name: "Personas",
      description: "Operaciones relacionadas con las personas",
    },
    {
      name: "Provincias",
      description: "Operaciones relacionadas con las provincias",
    },
    {
      name: "Tipos de Persona",
      description: "Operaciones relacionadas con los tipos de persona",
    },
  ],
  components: {
    schemas: {
      Auditoria: {
        type: "object",
        properties: {
          id_usuario: {
            type: "string",
            description: "ID del registro de auditoría",
          },
          modulo: {
            type: "string",
            description: "modulo donde se realiza los cambios",
          },
          operacion: {
            type: "string",
            description:
              "operacion sql realizada Crear, Eliminar, Modificar....",
          },
          detalle: {
            type: "string",
            description: "detalle de metodo SQL realizado INSERT INTO",
          },
          fecha: { 
            type: "string",
            format: "date-time",
            description: "Fecha y hora de la operación",
          },
          hora_ingreso: {
            type: "string",
            format: "time",
            description: "Hora de ingreso",
          },
          hora_salida: {
            type: "string",
            format: "time",
            description: "Hora de salida",
          },
          required: ["id_usuario", "modulo", "operacion", "detalle", "fecha","hora_ingreso","hora_salida"],
        },
      },
      Atencion: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID de la atención" },
          idHistoria: {
            type: "string",
            description: "ID de la historia clínica asociada",
          },
          fecha: {
            type: "string",
            format: "date",
            description: "Fecha de la atención",
          },
          idPersonal: {
            type: "string",
            description: "ID del personal de salud que atendió",
          },
        },
      },
      Canton: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID del cantón",
          },
          nombre: {
            type: "string",
            description: "Nombre del cantón",
          },
          id_provincia: {
            type: "string",
            description: "ID de la provincia a la que pertenece el cantón",
          },
        },
      },
      Diagnostico: {
        type: "object",
        properties: {
          id_enfermedad: {
            type: "string",
            description: "ID de la enfermedad diagnosticada",
          },
          id_aps: { type: "string", description: "ID de la APS asociada" },
        },
      },
      Enfermedad: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID de la enfermedad" },
          nombre: { type: "string", description: "Nombre de la enfermedad" },
        },
      },
      Especialidad: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID de la especialidad" },
          nombre: { type: "string", description: "Nombre de la especialidad" },
        },
      },
      Examen: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del examen" },
          idHistoria: {
            type: "string",
            description: "ID de la historia clínica asociada",
          },
          tipo: { type: "string", description: "Tipo de examen" },
          estado: { type: "string", description: "Estado del examen" },
        },
      },
      HistoriaClinica: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID de la historia clínica" },
          pacienteId: {
            type: "string",
            description: "ID del paciente asociado",
          },
          fechaCreacion: {
            type: "string",
            format: "date",
            description: "Fecha de creación de la historia",
          },
        },
      },
      Interaccion: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID de la interacción",
          },
          nombre: {
            type: "string",
            description: "Nombre de la interacción",
          },
        },
      },
      Paciente: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del paciente" },
          nombre: { type: "string", description: "Nombre del paciente" },
          estado: { type: "string", description: "Estado del paciente" },
        },
      },
      Parroquia: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID de la parroquia",
          },
          nombre: {
            type: "string",
            description: "Nombre de la parroquia",
          },
          id_canton: {
            type: "string",
            description: "ID del cantón al que pertenece la parroquia",
          },
        },
      },
      Persona: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID de la persona",
          },
          nombre: {
            type: "string",
            description: "Nombre de la persona",
          },
          // Agrega aquí el resto de las propiedades de la persona
        },
      },
      PersonalSalud: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del personal de salud" },
          nombre: {
            type: "string",
            description: "Nombre del personal de salud",
          },
          especialidad: {
            type: "string",
            description: "Especialidad del personal de salud",
          },
        },
      },
      Provincia: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID de la provincia",
          },
          nombre: {
            type: "string",
            description: "Nombre de la provincia",
          },
        },
      },
      SignosVitales: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID de los signos vitales" },
          idHistoria: {
            type: "string",
            description: "ID de la historia clínica asociada",
          },
          fecha: {
            type: "string",
            format: "date",
            description: "Fecha de registro de los signos vitales",
          },
        },
      },
      Terapia: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID de la terapia" },
          idHistoria: {
            type: "string",
            description: "ID de la historia clínica asociada",
          },
          tipo: { type: "string", description: "Tipo de terapia" },
        },
      },
      TipoEspecialidad: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del tipo de especialidad" },
          nombre: {
            type: "string",
            description: "Nombre del tipo de especialidad",
          },
        },
      },
      TipoPersona: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID del tipo de persona",
          },
          nombre: {
            type: "string",
            description: "Nombre del tipo de persona",
          },
        },
      },
      TipoTerapia: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del tipo de terapia" },
          nombre: { type: "string", description: "Nombre del tipo de terapia" },
        },
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del usuario" },
          nombre: { type: "string", description: "Nombre del usuario" },
          email: {
            type: "string",
            format: "email",
            description: "Email del usuario",
          },
        },
      },
    },
  },
  paths: {
    "/api/fcc/atencion": {
      get: {
        summary: "Obtiene todas las atenciones",
        tags: ["Atención"],
        responses: {
          200: {
            description: "Lista de atenciones",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Atencion" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea una nueva atención",
        tags: ["Atención"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Atencion" },
            },
          },
        },
        responses: {
          201: {
            description: "Atención creada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Atencion" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/atencion/{id}": {
      get: {
        summary: "Obtiene una atención por ID",
        tags: ["Atención"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Atención encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Atencion" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza una atención",
        tags: ["Atención"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Atencion" },
            },
          },
        },
        responses: {
          200: {
            description: "Atención actualizada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Atencion" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina una atención",
        tags: ["Atención"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Atención eliminada exitosamente",
          },
        },
      },
    },

    "/api/fcc/auditoria": {
      get: {
        summary: "Obtiene todos los registros de auditoría",
        tags: ["Auditorías"],
        responses: {
          200: {
            description: "Lista de registros de auditoría",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Auditoria" },
                },
              },
            },
          },
        },
      },

    post: {
      summary: "Registra una nueva auditoría",
      tags: ["Auditorías"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id_usuario: { type: "string", description: "ID del usuario" },
                fecha: { type: "string", format: "date-time", description: "Fecha de la operación" },
                modulo: { type: "string", description: "Módulo de operación" },
                operacion: { type: "string", description: "Operación realizada" },
                detalle: { type: "string", description: "Detalle de la operación" }
              },
              required: ["id_usuario", "modulo", "operacion", "detalle", "fecha","hora_ingreso","hora_salida"]
            }
          }
        }
      },
      responses: {
        201: {
          description: "Auditoría registrada exitosamente",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Auditoria" }
            }
          }
        }
      }
    },

    },
    "/api/fcc/auditoria/{id}": {
      get: {
        summary: "Obtiene información detallada de una auditoría específica",
        tags: ["Auditorías"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Detalles de la auditoría",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Auditoria" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza un registro de auditoria",
        tags: ["Auditorías"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Auditoria" },
            },
          },
        },
        responses: {
          200: {
            description: "Auditoría actualizada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Auditoria" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina una Auditoria",
        tags: ["Auditorías"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Auditoria eliminada exitosamente",
          },
        },
      },
    },

    "/api/fcc/diagnostico": {
      get: {
        summary: "Obtiene todos los diagnósticos",
        tags: ["Diagnósticos"],
        responses: {
          200: {
            description: "Lista de diagnósticos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Diagnostico" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo diagnóstico",
        tags: ["Diagnósticos"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Diagnostico" },
            },
          },
        },
        responses: {
          201: {
            description: "Diagnóstico creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Diagnostico" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/enfermedades": {
      get: {
        summary: "Obtiene todas las enfermedades",
        tags: ["Enfermedades"],
        responses: {
          200: {
            description: "Lista de enfermedades",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Enfermedad" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea una nueva enfermedad",
        tags: ["Enfermedades"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Enfermedad" },
            },
          },
        },
        responses: {
          201: {
            description: "Enfermedad creada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Enfermedad" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/especialidad": {
      get: {
        summary: "Obtiene todas las especialidades",
        tags: ["Especialidades"],
        responses: {
          200: {
            description: "Lista de especialidades",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Especialidad" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea una nueva especialidad",
        tags: ["Especialidades"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Especialidad" },
            },
          },
        },
        responses: {
          201: {
            description: "Especialidad creada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Especialidad" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/examen": {
      get: {
        summary: "Obtiene todos los exámenes",
        tags: ["Exámenes"],
        responses: {
          200: {
            description: "Lista de exámenes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Examen" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo examen",
        tags: ["Exámenes"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  // Definir propiedades del examen aquí
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Examen creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Examen" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/historia": {
      get: {
        summary: "Obtiene todas las historias clínicas",
        tags: ["Historia Clínica"],
        responses: {
          200: {
            description: "Lista de historias clínicas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HistoriaClinica" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea una nueva historia clínica",
        tags: ["Historia Clínica"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HistoriaClinica" },
            },
          },
        },
        responses: {
          201: {
            description: "Historia clínica creada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HistoriaClinica" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/historia/{id}": {
      get: {
        summary: "Obtiene una historia clínica por ID",
        tags: ["Historia Clínica"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Historia clínica encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HistoriaClinica" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza una historia clínica",
        tags: ["Historia Clínica"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HistoriaClinica" },
            },
          },
        },
        responses: {
          200: {
            description: "Historia clínica actualizada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HistoriaClinica" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina una historia clínica",
        tags: ["Historia Clínica"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Historia clínica eliminada exitosamente",
          },
        },
      },
    },
    "/api/fcc/paciente": {
      get: {
        summary: "Obtiene todos los pacientes",
        tags: ["Pacientes"],
        responses: {
          200: {
            description: "Lista de pacientes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Paciente" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo paciente",
        tags: ["Pacientes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Paciente" },
            },
          },
        },
        responses: {
          201: {
            description: "Paciente creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Paciente" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/paciente/{id}": {
      get: {
        summary: "Obtiene un paciente por ID",
        tags: ["Pacientes"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Paciente encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Paciente" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza un paciente",
        tags: ["Pacientes"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Paciente" },
            },
          },
        },
        responses: {
          200: {
            description: "Paciente actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Paciente" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina un paciente",
        tags: ["Pacientes"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Paciente eliminado exitosamente",
          },
        },
      },
    },
    "/api/fcc/paciente/estado/{id}": {
      put: {
        summary: "Cambia el estado de un paciente (eliminación lógica)",
        tags: ["Pacientes"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Estado del paciente actualizado exitosamente",
          },
        },
      },
    },
    "/api/fcc/personalsalud": {
      get: {
        summary: "Obtiene todo el personal de salud",
        tags: ["Personal de Salud"],
        responses: {
          200: {
            description: "Lista de personal de salud",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PersonalSalud" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo personal de salud",
        tags: ["Personal de Salud"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  // Definir propiedades del personal de salud aquí
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Personal de salud creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PersonalSalud" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/personalsalud/{id}": {
      get: {
        summary: "Obtiene personal de salud por ID",
        tags: ["Personal de Salud"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Personal de salud encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PersonalSalud" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza personal de salud",
        tags: ["Personal de Salud"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  // Definir propiedades del personal de salud aquí
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Personal de salud actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PersonalSalud" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina personal de salud",
        tags: ["Personal de Salud"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Personal de salud eliminado exitosamente",
          },
        },
      },
    },
    "/api/fcc/personalsalud/estado/{id}": {
      put: {
        summary: "Cambia el estado del personal de salud (eliminación lógica)",
        tags: ["Personal de Salud"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description:
              "Estado del personal de salud actualizado exitosamente",
          },
        },
      },
    },
    "/api/fcc/personalsalud/{id}/estadisticas": {
      get: {
        summary: "Obtiene estadísticas del personal de salud",
        tags: ["Personal de Salud"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Estadísticas del personal de salud",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  // Definir propiedades de las estadísticas aquí
                },
              },
            },
          },
        },
      },
    },
    "/api/fcc/signosvitales": {
      get: {
        summary: "Obtiene todos los registros de signos vitales",
        tags: ["Signos Vitales"],
        responses: {
          200: {
            description: "Lista de registros de signos vitales",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SignosVitales" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo registro de signos vitales",
        tags: ["Signos Vitales"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignosVitales" },
            },
          },
        },
        responses: {
          201: {
            description: "Registro de signos vitales creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignosVitales" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/signosvitales/{id}": {
      get: {
        summary: "Obtiene un registro de signos vitales por ID",
        tags: ["Signos Vitales"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Registro de signos vitales encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignosVitales" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza un registro de signos vitales",
        tags: ["Signos Vitales"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignosVitales" },
            },
          },
        },
        responses: {
          200: {
            description: "Registro de signos vitales actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignosVitales" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina un registro de signos vitales",
        tags: ["Signos Vitales"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Registro de signos vitales eliminado exitosamente",
          },
        },
      },
    },
    "/api/fcc/terapias": {
      get: {
        summary: "Obtiene todas las terapias",
        tags: ["Terapias"],
        responses: {
          200: {
            description: "Lista de terapias",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Terapia" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea una nueva terapia",
        tags: ["Terapias"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  // Definir propiedades de la terapia aquí
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Terapia creada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Terapia" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/terapias/{id}": {
      get: {
        summary: "Obtiene una terapia por ID",
        tags: ["Terapias"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Terapia encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Terapia" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza una terapia",
        tags: ["Terapias"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  // Definir propiedades de la terapia aquí
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Terapia actualizada exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Terapia" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina una terapia",
        tags: ["Terapias"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Terapia eliminada exitosamente",
          },
        },
      },
    },
    "/api/fcc/tipo_especialidad": {
      get: {
        summary: "Obtiene todos los tipos de especialidad",
        tags: ["Tipos de Especialidad"],
        responses: {
          200: {
            description: "Lista de tipos de especialidad",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TipoEspecialidad" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo tipo de especialidad",
        tags: ["Tipos de Especialidad"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TipoEspecialidad" },
            },
          },
        },
        responses: {
          201: {
            description: "Tipo de especialidad creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TipoEspecialidad" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/tipo_especialidad/{id}": {
      get: {
        summary: "Obtiene un tipo de especialidad por ID",
        tags: ["Tipos de Especialidad"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tipo de especialidad encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TipoEspecialidad" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza un tipo de especialidad",
        tags: ["Tipos de Especialidad"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TipoEspecialidad" },
            },
          },
        },
        responses: {
          200: {
            description: "Tipo de especialidad actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TipoEspecialidad" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina un tipo de especialidad",
        tags: ["Tipos de Especialidad"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tipo de especialidad eliminado exitosamente",
          },
        },
      },
    },
    "/api/fcc/tipo_terapia": {
      get: {
        summary: "Obtiene todos los tipos de terapia",
        tags: ["Tipos de Terapia"],
        responses: {
          200: {
            description: "Lista de tipos de terapia",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TipoTerapia" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo tipo de terapia",
        tags: ["Tipos de Terapia"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TipoTerapia" },
            },
          },
        },
        responses: {
          201: {
            description: "Tipo de terapia creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TipoTerapia" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/tipo_terapia/{id}": {
      get: {
        summary: "Obtiene un tipo de terapia por ID",
        tags: ["Tipos de Terapia"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tipo de terapia encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TipoTerapia" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza un tipo de terapia",
        tags: ["Tipos de Terapia"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TipoTerapia" },
            },
          },
        },
        responses: {
          200: {
            description: "Tipo de terapia actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TipoTerapia" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina un tipo de terapia",
        tags: ["Tipos de Terapia"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tipo de terapia eliminado exitosamente",
          },
        },
      },
    },
    "/api/fcc/users": {
      get: {
        summary: "Obtiene todos los usuarios",
        tags: ["Usuarios"],
        responses: {
          200: {
            description: "Lista de usuarios",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Usuario" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crea un nuevo usuario",
        tags: ["Usuarios"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Usuario" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario creado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
        },
      },
    },
    "/api/fcc/users/{id}": {
      get: {
        summary: "Obtiene un usuario por ID",
        tags: ["Usuarios"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Usuario encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualiza un usuario",
        tags: ["Usuarios"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Usuario" },
            },
          },
        },
        responses: {
          200: {
            description: "Usuario actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Elimina un usuario",
        tags: ["Usuarios"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Usuario eliminado exitosamente",
          },
        },
      },
    },
    "/api/fcc/users/login": {
      post: {
        summary: "Inicia sesión de usuario",
        tags: ["Usuarios"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  password: {
                    type: "string",
                  },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Inicio de sesión exitoso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                    user: {
                      $ref: "#/components/schemas/Usuario",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Credenciales inválidas",
          },
        },
      },
    },
    "/uploads/pacientes/perfil/fotos/{img}": {
      get: {
        summary: "Obtiene la imagen de perfil de un paciente",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "img",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de imagen",
          },
        ],
        responses: {
          200: {
            description: "Imagen de perfil del paciente",
            content: {
              "image/*": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Imagen no encontrada",
          },
        },
      },
    },
    "/uploads/pacientes/cedulas/archivos/{file}": {
      get: {
        summary: "Obtiene la cédula de un paciente",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "file",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de cédula",
          },
        ],
        responses: {
          200: {
            description: "Archivo de cédula del paciente",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Archivo no encontrado",
          },
        },
      },
    },
    "/uploads/pacientes/certificados/archivos/{file}": {
      get: {
        summary: "Obtiene el certificado médico de un paciente",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "file",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de certificado",
          },
        ],
        responses: {
          200: {
            description: "Archivo de certificado médico del paciente",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Archivo no encontrado",
          },
        },
      },
    },
    "/uploads/historia/{file}": {
      get: {
        summary: "Obtiene un archivo de historia clínica",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "file",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de historia clínica",
          },
        ],
        responses: {
          200: {
            description: "Archivo de historia clínica",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Archivo no encontrado",
          },
        },
      },
    },
    "/uploads/personal/perfil/archivo/{img}": {
      get: {
        summary: "Obtiene la imagen de perfil de un personal de salud",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "img",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de imagen",
          },
        ],
        responses: {
          200: {
            description: "Imagen de perfil del personal de salud",
            content: {
              "image/*": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Imagen no encontrada",
          },
        },
      },
    },
    "/uploads/personal/hdv/archivo/{file}": {
      get: {
        summary: "Obtiene el archivo de hoja de vida del personal de salud",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "file",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de hoja de vida",
          },
        ],
        responses: {
          200: {
            description: "Archivo de hoja de vida del personal de salud",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Archivo no encontrado",
          },
        },
      },
    },
    "/uploads/examenes/{id_historia}/{file}": {
      get: {
        summary: "Obtiene un archivo de examen médico",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "id_historia",
            required: true,
            schema: { type: "string" },
            description: "ID de la historia clínica",
          },
          {
            in: "path",
            name: "file",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de examen",
          },
        ],
        responses: {
          200: {
            description: "Archivo de examen médico",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Archivo no encontrado",
          },
        },
      },
    },
    "/uploads/terapias/{id_historia}/{file}": {
      get: {
        summary: "Obtiene un archivo de terapia",
        tags: ["Uploads"],
        parameters: [
          {
            in: "path",
            name: "id_historia",
            required: true,
            schema: { type: "string" },
            description: "ID de la historia clínica",
          },
          {
            in: "path",
            name: "file",
            required: true,
            schema: { type: "string" },
            description: "Nombre del archivo de terapia",
          },
        ],
        responses: {
          200: {
            description: "Archivo de terapia",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Archivo no encontrado",
          },
        },
      },
    },
  },
};

module.exports = swaggerDefinitions;
