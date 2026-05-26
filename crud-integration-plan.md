# Backend-Frontend CRUD Integration Plan

## Phase 1: Backend Critical Fixes
1.1 Fix GetAllUsers response format (User → UserResponse)
1.2 Verify CORS preflight handles JSON Content-Type

## Phase 2: Backend Teams Module
2.1 Domain model: internal/domain/team.go
2.2 Repository: internal/team/repository/mysql/mysql_team.go
2.3 Usecase: internal/team/usecase/team_usecase.go
2.4 Handler: internal/team/delivery/http/team_handler.go
2.5 Wire in meroedu.go

## Phase 3: Backend Role CRUD
3.1 POST /roles, PUT /roles/:id, DELETE /roles/:id handlers
3.2 CreateRole, UpdateRole, DeleteRole usecase methods
3.3 UpdateRole, DeleteRole repo methods

## Phase 4: Frontend Wiring
4.1 Users: wire User.jsx, UserCreate, UserEdit, UserDetail to real API
4.2 Teams: wire Team.jsx, TeamCreate, TeamEdit, TeamDetail to real API
4.3 Roles: wire RoleManagement, RoleCreate, RoleEdit to real API
4.4 Profile: Settings.jsx updateProfile/changePassword to real API
