import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface ManpowerItem {
  role: string;
  count: number;
}

export interface EquipmentItem {
  name: string;
  status: 'beroperasi' | 'standby' | 'rusak';
  hours: number;
}

export interface UpsertDailyLogDto {
  logDate: string;
  weatherMorning?: string;
  weatherAfternoon?: string;
  weatherEvening?: string;
  workHoursEffective?: number;
  workHoursLost?: number;
  manpowerData?: ManpowerItem[];
  equipmentData?: EquipmentItem[];
  workProgressSummary: string;
  issuesAndDelays?: string;
}

@Injectable()
export class DailyLogsService {
  constructor(private readonly db: DatabaseService) {}

  async findByProject(projectId: string, limit: number = 30) {
    const res = await this.db.query(
      `SELECT dsl.*, u.name as reporter_name, u.email as reporter_email
       FROM daily_site_logs dsl
       LEFT JOIN users u ON u.id = dsl.created_by
       WHERE dsl.project_id = $1
       ORDER BY dsl.log_date DESC
       LIMIT $2`,
      [projectId, limit],
    );

    return res.rows.map((row) => ({
      ...row,
      work_hours_effective: parseFloat(row.work_hours_effective),
      work_hours_lost: parseFloat(row.work_hours_lost),
    }));
  }

  async findByDate(projectId: string, logDate: string) {
    const res = await this.db.query(
      `SELECT dsl.*, u.name as reporter_name, u.email as reporter_email
       FROM daily_site_logs dsl
       LEFT JOIN users u ON u.id = dsl.created_by
       WHERE dsl.project_id = $1 AND dsl.log_date = $2`,
      [projectId, logDate],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`Laporan harian tanggal ${logDate} tidak ditemukan.`);
    }

    const row = res.rows[0];
    return {
      ...row,
      work_hours_effective: parseFloat(row.work_hours_effective),
      work_hours_lost: parseFloat(row.work_hours_lost),
    };
  }

  async upsert(projectId: string, data: UpsertDailyLogDto, userId?: string) {
    const effective = data.workHoursEffective !== undefined ? data.workHoursEffective : 8.0;
    const lost = data.workHoursLost !== undefined ? data.workHoursLost : 0.0;
    const manpowerJson = JSON.stringify(data.manpowerData || []);
    const equipmentJson = JSON.stringify(data.equipmentData || []);

    const res = await this.db.query(
      `INSERT INTO daily_site_logs (
         project_id, log_date, weather_morning, weather_afternoon, weather_evening,
         work_hours_effective, work_hours_lost, manpower_data, equipment_data,
         work_progress_summary, issues_and_delays, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, $12)
       ON CONFLICT (project_id, log_date) DO UPDATE SET
         weather_morning = EXCLUDED.weather_morning,
         weather_afternoon = EXCLUDED.weather_afternoon,
         weather_evening = EXCLUDED.weather_evening,
         work_hours_effective = EXCLUDED.work_hours_effective,
         work_hours_lost = EXCLUDED.work_hours_lost,
         manpower_data = EXCLUDED.manpower_data,
         equipment_data = EXCLUDED.equipment_data,
         work_progress_summary = EXCLUDED.work_progress_summary,
         issues_and_delays = EXCLUDED.issues_and_delays
       RETURNING *`,
      [
        projectId,
        data.logDate,
        data.weatherMorning || 'cerah',
        data.weatherAfternoon || 'cerah',
        data.weatherEvening || 'cerah',
        effective,
        lost,
        manpowerJson,
        equipmentJson,
        data.workProgressSummary,
        data.issuesAndDelays || null,
        userId || null,
      ],
    );

    const row = res.rows[0];
    return {
      ...row,
      work_hours_effective: parseFloat(row.work_hours_effective),
      work_hours_lost: parseFloat(row.work_hours_lost),
    };
  }

  async calculateEotSummary(projectId: string) {
    const res = await this.db.query(
      `SELECT
         1 as total_days_logged,
         COALESCE(work_hours_lost, 0) as total_hours_lost,
         COALESCE(work_hours_effective, 0) as total_hours_effective,
         (CASE WHEN weather_morning IN ('hujan_lebat', 'banjir') 
                  OR weather_afternoon IN ('hujan_lebat', 'banjir') 
                  OR weather_evening IN ('hujan_lebat', 'banjir') 
               THEN 1 ELSE 0 END)::int as rain_days_count,
         dsl.manpower_data,
         dsl.equipment_data
       FROM daily_site_logs dsl
       WHERE dsl.project_id = $1
       ORDER BY dsl.log_date ASC`,
      [projectId],
    );

    if (res.rows.length === 0) {
      return {
        totalDaysLogged: 0,
        totalHoursLost: 0,
        totalHoursEffective: 0,
        eotDaysClaimable: 0,
        rainDaysCount: 0,
        averageWorkersDaily: 0,
        equipmentOperatingRatio: 0,
        recommendation: 'Belum ada log laporan harian tercatat.',
      };
    }

    // Aggregate summary
    let totalDaysLogged = 0;
    let totalHoursLost = 0;
    let totalHoursEffective = 0;
    let rainDaysCount = 0;
    let totalWorkers = 0;
    let totalEquipments = 0;
    let activeEquipments = 0;

    for (const r of res.rows) {
      totalDaysLogged += r.total_days_logged;
      totalHoursLost += parseFloat(r.total_hours_lost);
      totalHoursEffective += parseFloat(r.total_hours_effective);
      rainDaysCount += r.rain_days_count;

      const manpower = Array.isArray(r.manpower_data) ? r.manpower_data : [];
      const dayWorkers = manpower.reduce((acc: number, m: any) => acc + (m.count || 0), 0);
      totalWorkers += dayWorkers;

      const equipment = Array.isArray(r.equipment_data) ? r.equipment_data : [];
      for (const eq of equipment) {
        totalEquipments++;
        if (eq.status === 'beroperasi') {
          activeEquipments++;
        }
      }
    }

    const eotDaysClaimable = Math.round((totalHoursLost / 8.0) * 10) / 10;
    const avgWorkers = totalDaysLogged > 0 ? Math.round(totalWorkers / totalDaysLogged) : 0;
    const equipRatio = totalEquipments > 0 ? Math.round((activeEquipments / totalEquipments) * 100) : 0;

    let recommendation = 'Kondisi cuaca terkendali. Belum memenuhi ambang batas klaim EOT ke Owner.';
    if (eotDaysClaimable >= 0.5) {
      recommendation = `Proyek berhak menyusun Berita Acara Keterlambatan Cuaca (EOT Claim) sebesar ${eotDaysClaimable} hari kerja (${totalHoursLost} jam hilang akibat force majeure hujan deras).`;
    }

    return {
      totalDaysLogged,
      totalHoursLost,
      totalHoursEffective,
      eotDaysClaimable,
      rainDaysCount,
      averageWorkersDaily: avgWorkers,
      equipmentOperatingRatio: equipRatio,
      recommendation,
    };
  }
}
