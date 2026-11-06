import { type RouteConfig, index,route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
       route("api/exam-token", "routes/api.exam-token.ts"),
   route("exam/:examId/teacher", "routes/exam.teacher.tsx"),
] satisfies RouteConfig;
