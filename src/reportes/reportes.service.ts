import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NOMBRES_FACTORES, RECOMENDACIONES_POR_FACTOR, MENSAJES_GENERALES } from './data/recomendaciones.data';

@Injectable()
export class ReportesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Mensajes de ánimo por categoría
  private readonly MENSAJES_ANIMO = {
    Bajo: [
      '¡Excelente! Tu nivel de estrés está bajo control. Sigue así.',
      '¡Vas muy bien! Mantén tus hábitos de estudio saludables.',
      'Tu bienestar académico es notable. ¡Continúa con ese ritmo!',
    ],
    Medio: [
      'Tu estrés es manejable. Recuerda tomar descansos regulares.',
      'Vas bien, pero considera organizar mejor tus tiempos de estudio.',
      'Un poco de estrés es normal. Practica técnicas de relajación.',
    ],
    Alto: [
      'Tu nivel de estrés es alto. Considera hablar con un orientador.',
      'Es importante que busques apoyo. No enfrentes esto solo.',
      'Recuerda que pedir ayuda es una fortaleza, no una debilidad.',
    ],
  };

  private getMensajeAnimo(categoria: string): string {
    const mensajes = this.MENSAJES_ANIMO[categoria] ?? this.MENSAJES_ANIMO.Medio;
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  }

  async getReporteEstres(usuarioId: string, accessToken: string) {
    const supabase = this.supabaseService.getClient();

    // Calcular rango de la semana actual (lunes a domingo)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0=domingo, 1=lunes...
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diasDesdeElLunes);
    lunes.setHours(0, 0, 0, 0);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);

    // Obtener capturas de la semana actual
    const { data: capturas, error } = await supabase
        .from('capturas_estres')
        .select('ne_valor, fecha_captura, factor')
        .eq('usuario_id', usuarioId)
        .gte('fecha_captura', lunes.toISOString())
        .lte('fecha_captura', domingo.toISOString())
        .order('fecha_captura', { ascending: true });

    if (error) {
        throw new InternalServerErrorException('Error al obtener el historial de estrés');
    }

    // Verificar si hay datos suficientes
    if (!capturas || capturas.length < 3) {
        return {
        datos_insuficientes: true,
        mensaje: 'Se necesitan al menos 3 capturas para generar la gráfica temporal',
        capturas_disponibles: capturas?.length ?? 0,
        semana: {
            inicio: lunes.toISOString().split('T')[0],
            fin: domingo.toISOString().split('T')[0],
        },
        grafica_temporal: capturas?.map(c => ({
            fecha: c.fecha_captura,
            ne_valor: c.ne_valor,
        })) ?? [],
        grafica_distribucion: [],
        mensaje_animo: null,
        };
    }

    // Gráfica temporal
    const graficaTemporal = capturas.map(c => ({
        fecha: c.fecha_captura,
        ne_valor: c.ne_valor,
    }));

    // Gráfica de distribución
    const factoresAcumulados: Record<string, number[]> = {};
    capturas.forEach(c => {
        if (c.factor) {
        Object.entries(c.factor).forEach(([key, valor]) => {
            if (!factoresAcumulados[key]) factoresAcumulados[key] = [];
            factoresAcumulados[key].push(Number(valor));
        });
        }
    });

    const graficaDistribucion = Object.entries(factoresAcumulados).map(([factor, valores]) => ({
        factor,
        promedio: Math.round(valores.reduce((sum, v) => sum + v, 0) / valores.length * 100) / 100,
    }));

    // NE promedio y mensaje de ánimo
    const nePromedio = capturas.reduce((sum, c) => sum + c.ne_valor, 0) / capturas.length;
    const categoria = nePromedio < 34 ? 'Bajo' : nePromedio < 67 ? 'Medio' : 'Alto';

    return {
        datos_insuficientes: false,
        semana: {
        inicio: lunes.toISOString().split('T')[0],
        fin: domingo.toISOString().split('T')[0],
        },
        periodo: {
        total_capturas: capturas.length,
        },
        ne_promedio: Math.round(nePromedio * 10) / 10,
        categoria,
        grafica_temporal: graficaTemporal,
        grafica_distribucion: graficaDistribucion,
        mensaje_animo: this.getMensajeAnimo(categoria),
    };
    }

    async getRecomendacionPersonalizada(usuarioId: string) {
        const supabase = this.supabaseService.getClient();

        // Obtener estresores del usuario
        const { data: estresores, error } = await supabase
            .from('estresores')
            .select('factor_id, peso')
            .eq('usuario_id', usuarioId);

        if (error) {
            throw new InternalServerErrorException('Error al obtener los estresores');
        }

        if (!estresores || estresores.length === 0) {
            return {
            sin_datos: true,
            mensaje: 'Aún no tienes estresores configurados para generar una recomendación',
            };
        }

        // Pesos reales (importancia de cada factor en el cálculo del NE)
        const PESOS_REALES: Record<number, number> = {
            1: 0.143, 2: 0.151, 3: 0.152, 4: 0.063,
            5: 0.132, 6: 0.118, 7: 0.106, 8: 0.134,
        };

        // Calcular contribución de cada factor al NE (peso del usuario * peso real)
        const contribuciones = estresores.map(e => ({
            factor_id: e.factor_id,
            peso_usuario: e.peso,
            contribucion: e.peso * (PESOS_REALES[e.factor_id] ?? 0),
        }));

        // Ordenar por contribución descendente y tomar top 2-3
        const topFactores = contribuciones
            .sort((a, b) => b.contribucion - a.contribucion)
            .slice(0, 3);

        // Calcular NE general para determinar la categoría
        let numerador = 0;
        let denominador = 0;
        estresores.forEach(e => {
            const pr = PESOS_REALES[e.factor_id];
            if (pr !== undefined) {
            numerador += e.peso * pr;
            denominador += pr;
            }
        });

        if (denominador < 0.1) {
            return { sin_datos: true, mensaje: 'No hay suficientes datos para calcular tu nivel de estrés' };
        }

        const neValor = Math.round((numerador / denominador) * 20 * 10) / 10;
        const categoria: 'Bajo' | 'Medio' | 'Alto' = neValor < 34 ? 'Bajo' : neValor < 67 ? 'Medio' : 'Alto';

        // Generar recomendaciones por cada factor dominante
        const recomendaciones = topFactores.map(f => {
            const mensajesFactor = RECOMENDACIONES_POR_FACTOR[f.factor_id]?.[categoria] ?? [];
            const mensaje = mensajesFactor[Math.floor(Math.random() * mensajesFactor.length)]
            ?? 'Sigue trabajando en mantener un buen equilibrio en este aspecto.';

            return {
            factor_id: f.factor_id,
            factor_nombre: NOMBRES_FACTORES[f.factor_id],
            peso_usuario: f.peso_usuario,
            recomendacion: mensaje,
            };
        });

        // Mensaje general por categoría
        const mensajesGenerales = MENSAJES_GENERALES[categoria];
        const mensajeGeneral = mensajesGenerales[Math.floor(Math.random() * mensajesGenerales.length)];

        return {
            sin_datos: false,
            ne_valor: neValor,
            categoria,
            mensaje_general: mensajeGeneral,
            factores_dominantes: recomendaciones,
        };
    }
}