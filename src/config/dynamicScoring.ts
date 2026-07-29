export type ScoringThreshold = {
  min_percentage: number;
  status: string;
};

export type DynamicScoringConfig = {
  method: 'weighted_average_percentage';
  weights: Record<string, number>; // section_name -> weight
  max_value_per_question: number;
  status_thresholds: ScoringThreshold[];
  has_kesimpulan: boolean;
};

// Map instrumen_nama -> config
// Kita gunakan nama_instrumen sebagai key karena ID bisa berubah jika di-seed ulang
export const DYNAMIC_SCORING_REGISTRY: Record<string, DynamicScoringConfig> = {
  'Instrumen MONEV MATGEM 2026': {
    method: 'weighted_average_percentage',
    weights: {
      'Perencanaan': 0.3,
      'Pelaksanaan': 0.5,
      'Evaluasi': 0.2
      // 'Wawancara Refleksi' tidak ada di bobot, jadi tidak dihitung
    },
    max_value_per_question: 4,
    has_kesimpulan: true,
    status_thresholds: [
      { min_percentage: 85, status: 'SANGAT SESUAI' },
      { min_percentage: 70, status: 'SESUAI' },
      { min_percentage: 50, status: 'KURANG SESUAI' },
      { min_percentage: 0, status: 'TIDAK SESUAI' }
    ]
  }
};

export function calculateDynamicScore(
  config: DynamicScoringConfig,
  jawabanValues: Record<string, any>,
  sections: any[]
) {
  let totalScorePercentage = 0;
  
  const sectionScores: Record<string, {
    score: number;
    maxScore: number;
    percentage: number;
    weightedPercentage: number;
  }> = {};

  sections.forEach(section => {
    const weight = config.weights[section.nama_section];
    if (weight !== undefined) {
      let sectionScore = 0;
      let sectionMaxScore = 0;
      
      section.items.forEach((item: any) => {
        if (item.tipe_jawaban === 'likert4') {
          const ans = jawabanValues[item.id];
          if (ans && typeof ans.nilai_skor === 'number') {
            sectionScore += ans.nilai_skor;
            sectionMaxScore += config.max_value_per_question;
          }
        }
      });
      
      const percentage = sectionMaxScore > 0 ? (sectionScore / sectionMaxScore) * 100 : 0;
      const weightedPercentage = percentage * weight;
      
      sectionScores[section.nama_section] = {
        score: sectionScore,
        maxScore: sectionMaxScore,
        percentage,
        weightedPercentage
      };
      
      totalScorePercentage += weightedPercentage;
    }
  });

  // Tentukan status
  let finalStatus = config.status_thresholds[config.status_thresholds.length - 1].status;
  for (const threshold of config.status_thresholds) {
    if (totalScorePercentage >= threshold.min_percentage) {
      finalStatus = threshold.status;
      break;
    }
  }

  return {
    totalScorePercentage,
    finalStatus,
    sectionScores
  };
}
