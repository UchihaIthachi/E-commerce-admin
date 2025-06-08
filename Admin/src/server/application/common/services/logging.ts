type Severity = "SEVERE" | "WARNING" | "INFO";

export const log = (severity: Severity, message: string | unknown) => {
  console.log(severity, message);
};
