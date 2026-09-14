@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET ___MVNW_UNDERSCORE__=_
@SET __MVNW_VER__=3.2.0
@SET __MVNW_LAUNCHER__=maven-wrapper-3.2.0.jar

@setlocal

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%__MVNW_WRAPPER_DIR__%.mvn\wrapper\maven-wrapper.properties") DO (
    @IF "%%A"=="distributionUrl" SET MVNW_REPOURL=%%B
)

@IF "%MVNW_REPOURL%"=="" SET MVNW_REPOURL=https://repo.maven.apache.org/maven2

@SET MAVEN_WRAPPER_JAR="%__MVNW_WRAPPER_DIR__%.mvn\wrapper\maven-wrapper.jar"

@SET DOWNLOAD_URL=%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/%__MVNW_VER__%/%__MVNW_LAUNCHER__%

@IF NOT EXIST %MAVEN_WRAPPER_JAR% (
    @ECHO Downloading Maven Wrapper from: %DOWNLOAD_URL%
    @powershell -Command "(New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%MAVEN_WRAPPER_JAR%')"
)

@SET JAVA_HOME_CANDIDATE=%JAVA_HOME%
@IF "%JAVA_HOME_CANDIDATE%"=="" (
    @FOR /f "tokens=*" %%i IN ('where java 2^>nul') DO (
        @SET JAVA_EXEC=%%i
        @GOTO :found_java
    )
    @ECHO ERROR: JAVA_HOME is not set and no java command found in PATH
    @EXIT /B 1
    :found_java
) ELSE (
    @SET JAVA_EXEC="%JAVA_HOME_CANDIDATE%\bin\java"
)

@SET MAVEN_WRAPPER_PROPERTIES="%__MVNW_WRAPPER_DIR__%.mvn\wrapper\maven-wrapper.properties"

@%JAVA_EXEC% -jar %MAVEN_WRAPPER_JAR% --spring-boot %*
