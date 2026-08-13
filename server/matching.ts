type StudentRequirementLike = {
  subjects?: string | null;
  board?: string | null;
  stream?: string | null;
  mode?: string | null;
  tutorGenderPreference?: string | null;
};

type TutorProfileLike = {
  subjects?: string | null;
  boards?: string | null;
  mode?: string | null;
  gender?: string | null;
};

function tokens(value?: string | null) {
  return new Set(
    (value ?? "")
      .toLowerCase()
      .split(/[,/&|;]+|\band\b/)
      .map(item => item.trim())
      .filter(Boolean)
  );
}

function countOverlap(first?: string | null, second?: string | null) {
  const left = tokens(first);
  const right = tokens(second);
  return Array.from(left).filter(item => right.has(item)).length;
}

function compatibleMode(first?: string | null, second?: string | null) {
  return first === "both" || second === "both" || first === second;
}

/** Score a tutor against a student/parent requirement. Higher scores appear first. */
export function scoreTutorMatch(student: StudentRequirementLike, tutor: TutorProfileLike) {
  const subjectMatches = countOverlap(student.subjects, tutor.subjects);
  const reasons: string[] = [];
  let matchScore = Math.min(subjectMatches * 30, 60);

  if (subjectMatches > 0) reasons.push(`${subjectMatches} subject match${subjectMatches === 1 ? "" : "es"}`);
  if (student.board && student.board !== "Other" && (tutor.boards ?? "").toLowerCase().includes(student.board.toLowerCase())) {
    matchScore += 20;
    reasons.push(`${student.board} support`);
  }
  if (compatibleMode(student.mode, tutor.mode)) {
    matchScore += 10;
    reasons.push("teaching mode fits");
  }
  if (student.tutorGenderPreference && student.tutorGenderPreference !== "no_preference" && student.tutorGenderPreference === tutor.gender) {
    matchScore += 10;
    reasons.push("gender preference fits");
  }
  if (student.stream && tokens(student.stream).size > 0 && subjectMatches > 0) {
    matchScore += 5;
    reasons.push("higher-education subject fit");
  }
  return { matchScore, matchReasons: reasons };
}

/** Score a student/parent requirement against a tutor profile. */
export function scoreStudentMatch(tutor: TutorProfileLike, student: StudentRequirementLike) {
  return scoreTutorMatch(student, tutor);
}
