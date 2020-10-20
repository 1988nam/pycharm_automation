package elevenst_util;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.io.BufferedInputStream;
import java.io.File;

import org.apache.commons.io.FileUtils;
import org.junit.runner.Description;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.ChartLocation;

import java.text.SimpleDateFormat;
import static io.restassured.RestAssured.*;

public class Common {

	public static By by; //by 선언
	public static WebDriverWait wait; //wait 선언
	public static final int WAIT_TIMEOUT = 45; //wait 시간 값
	public static final int RETRY_COUNT = 3;
	public static final int PATH = 1;
	public static final int CSS = 2;
	public static final int TEXT = 3;
	public static final int ID = 4;

	public static final int FNAME = 1;
	public static final int FOLDER = 2;
	public static final int MONTH = 3;
	public static final int DATE = 4;

	public static final int PC = 1;
	public static final int MW = 2;

	public static ExtentTest test;
	public static ExtentHtmlReporter htmlReporter;
	public static ExtentReports extent;

	public static WebDriver driver;

	public static String suiteName;
	public static String methodName;
	public static String PackageName = System.getProperty("test");
	public static String temp_browser_type = System.getProperty("browser_type");
	public static String browser_type = System.getProperty("browser_type");
	public static String OSType = System.getProperty("os.name");
	public static String Server_Type = System.getProperty("server_type");

	public static int testCount=0;

	@Rule
	public Screen_Shot Screen_Shot = new Screen_Shot() {
        @Override
        protected void starting(final Description description) {
        	String className = description.getClassName();

        	String methodName = description.getMethodName();
        	methodName = methodName.substring(0, methodName.length()-2);
            methodName += browser_type;
            methodName += "]";

            className = className.substring(className.lastIndexOf('.') + 1);
            suiteName = className;
            Common.methodName = methodName;
        }
    }; // Class, Script 명 가져와서 suitename, methodname 에 저장하기

    @Rule
    public Retry retry = new Retry(RETRY_COUNT);

	@BeforeClass
	public static void create_Report() throws Exception {

		if (!Server_Type.equalsIgnoreCase("real") && !Server_Type.equalsIgnoreCase("dev") && Server_Type == null) {
			System.err.println("[ER] Setting server_type parameter between \"real\" or \"dev\" : " + Server_Type);

			//System.exit(-1);
		}

		extent = createReport();
	}

	@Before
    public void beforeMethod() throws Exception {
		if(retry.firstTry) {
			test = extent.createTest(methodName);
		}

		testCount=retry.testCount;

    }

	public static boolean launchBrowser(String browserName, int type) throws Exception {

		String Browser_Path = "";
		Thread.sleep(3000);

		if (browserName.equalsIgnoreCase("firefox")) {
			if (OSType.contains("Mac")) {
				System.setProperty("webdriver.firefox.bin", "/Applications/Firefox.app/Contents/MacOS/firefox-bin");
			} else {
				if (new File("C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe").isFile()) {
					System.setProperty("webdriver.firefox.bin",
							"C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe");
				} else if (new File("C:\\Program Files\\Mozilla Firefox\\firefox.exe").isFile()) {
					System.setProperty("webdriver.firefox.bin", "C:\\Program Files\\Mozilla Firefox\\firefox.exe");
				} else {
					System.err.println("[ER] : Fail to find firefox.exe");
				}
			}
			if (type == PC) {
				driver = new FirefoxDriver();
			} else if (type == MW) {
				// firefox MW 화면으로 설정변경
				FirefoxProfile profile = new FirefoxProfile();
				profile.setPreference("general.useragent.override",
						"Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A543a Safari/419.3");
				driver = new FirefoxDriver(profile);

			}
			return true;

		} else if (browserName.equalsIgnoreCase("chrome")) {
			if (OSType.contains("Mac")) {
				Browser_Path = System.getProperty("user.dir") + "/resource/chromedriver";
				System.setProperty("webdriver.chrome.driver", Browser_Path);

			} else {
				Browser_Path = System.getProperty("user.dir") + "\\resource\\chromedriver.exe";
				System.setProperty("webdriver.chrome.driver", Browser_Path);

			}
			if (type == PC) {
				// local server에서 chrome 실행 시 proxy 설정 이슈 해결
				ChromeOptions chromeOptions = new ChromeOptions();
				chromeOptions.addArguments("--verbose");
				chromeOptions.addArguments("--whitelisted-ips=''");
				chromeOptions.addArguments("--proxy-server=");
				chromeOptions.addArguments("--no-sandbox");
				chromeOptions.addArguments("--privileged");

				driver = new ChromeDriver(chromeOptions);
			} else if (type == MW) {
				// chrome MW 화면으로 설정변경
				/*DesiredCapabilities capabilities = DesiredCapabilities.chrome();

				Map<String, String> mobileEmulation = new HashMap<String, String>();
				mobileEmulation.put("deviceName", "iPad Pro");
				Map<String, Object> mobileOptions = new HashMap<String, Object>();
				mobileOptions.put("mobileEmulation", mobileEmulation);
				mobileOptions.put("args", Arrays.asList("--verbose", "--whitelisted-ips=''", "--proxy-server=",
						"--no-sandbox", "--privileged", "--disable-setuid-sandbox", "--chromedriver-executable"));
				capabilities.setCapability(ChromeOptions.CAPABILITY, mobileOptions);
				driver = new ChromeDriver(capabilities);*/

				Map<String, Object> deviceMetrics = new HashMap<String, Object>();
				deviceMetrics.put("width", 1920);
				deviceMetrics.put("height", 1024);
				deviceMetrics.put("pixelRatio", 1);

				Map<String, Object> mobileEmulation = new HashMap<String, Object>();

				mobileEmulation.put("deviceMetrics", deviceMetrics);
				mobileEmulation.put("userAgent", "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19");

				ChromeOptions chromeOptions = new ChromeOptions();
				chromeOptions.setExperimentalOption("mobileEmulation", mobileEmulation);
				chromeOptions.addArguments("--headless");

				driver = new ChromeDriver(chromeOptions);
				driver.manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
				driver.manage().window().maximize();

			}
			return true;

		} else if (browserName.equalsIgnoreCase("ie")) {

			if (OSType.contains("Mac")) {

				System.err.println("[ER] No IE browser in Mac OS");
				return false;

			} else {
				Browser_Path = System.getProperty("user.dir") + "\\resource\\IEDriverServer.exe";
				System.setProperty("webdriver.ie.driver", Browser_Path);

				DesiredCapabilities capability = DesiredCapabilities.internetExplorer();
				capability.setCapability(InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, true);
				capability.setCapability(InternetExplorerDriver.IGNORE_ZOOM_SETTING, true);
				capability.setCapability(InternetExplorerDriver.REQUIRE_WINDOW_FOCUS, true);
				capability.setCapability(InternetExplorerDriver.ENABLE_PERSISTENT_HOVERING, true);
				capability.setCapability(InternetExplorerDriver.NATIVE_EVENTS, false);
				capability.setCapability(InternetExplorerDriver.UNEXPECTED_ALERT_BEHAVIOR, "accept");
				capability.setCapability(InternetExplorerDriver.REQUIRE_WINDOW_FOCUS, true);
				capability.setCapability(InternetExplorerDriver.NATIVE_EVENTS, false);
				capability.setJavascriptEnabled(true);

				capability.setCapability("ignoreProtectedModeSettings", true);
				capability.setCapability("requireWindowFocus", true);
				capability.setCapability("ie.enableFullPageScreenshot", true);

				driver = new InternetExplorerDriver(capability);
				return true;
			}

		} else {
			System.err.println("[ER] Fail to create Driver - Invalid Driver Type : " + browserName);
			return false;
		}
	}



	protected static void waitUntilVisible(int Type,  String path) {

		System.out.println("[DG] " + java.lang.Thread.currentThread().getStackTrace()[1].getMethodName() + " : " + path);
		wait = new WebDriverWait(driver, WAIT_TIMEOUT);

		switch (Type) {
		case PATH :
			by = By.xpath(path);
			break;
		case CSS :
			by = By.cssSelector(path);
			break;
		case TEXT :
			by = By.linkText(path);
			break;
		case ID :
			by = By.id(path);
			break;
		default :
			System.out.println("잘못된 Type 입니다.");
			break;
		}

		wait.until(ExpectedConditions.visibilityOfElementLocated(by));
	}

	protected static void waitUntilClickable(int Type, String path) {

		System.out.println("[DG] " + java.lang.Thread.currentThread().getStackTrace()[1].getMethodName() + " : " + path);
		wait = new WebDriverWait(driver, WAIT_TIMEOUT);

		switch (Type) {
		case PATH :
			by = By.xpath(path);
			break;
		case CSS :
			by = By.cssSelector(path);
			break;
		case TEXT :
			by = By.linkText(path);
			break;
		case ID :
			by = By.id(path);
			break;
		default :
			System.out.println("잘못된 Type 입니다.");
			break;
		}

		wait.until(ExpectedConditions.elementToBeClickable(by));

	}

	public static boolean isElementDisplayed(By by) {
		driver.manage().timeouts().implicitlyWait(2, TimeUnit.SECONDS);
		try {
			if(driver.findElement(by).isDisplayed())
				return true;
			else
				return false;
		} catch (NoSuchElementException e) {
			return false;
		} finally {
			driver.manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
		}
	}

	public boolean isElementPresent(String object) {
	    By by = By.xpath(object);
		try {
	    	driver.findElement(by);
	    	System.out.println("[TR] " + java.lang.Thread.currentThread().getStackTrace()[1].getMethodName() + " : search Element - " + object);
	        return true;
	    } catch (NoSuchElementException e) {
	    	System.out.println("[TR] " + java.lang.Thread.currentThread().getStackTrace()[1].getMethodName() + " : no search Element - " + object);
	    	return false;
	    }
	}

	protected static void takeScreenshot(String Text) throws Exception {

		test.assignCategory(browser_type);
		String Report_Path = "";

		if (OSType.contains("Mac")) {
			Report_Path = System.getProperty("user.dir") + "/report/" + timestamp(MONTH) + "/" + timestamp(FOLDER) + "/image/";
		} else {
			Report_Path = System.getProperty("user.dir") + "\\report\\" + timestamp(MONTH) + "\\" + timestamp(FOLDER) + "\\image\\";
		}

		String Screen_File_Name = timestamp(FNAME) + ".jpeg";

		if (driver != null) {
			try {

				File sourceFile = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
				File targetFile = new File (Report_Path + Screen_File_Name);
				FileUtils.copyFile(sourceFile, targetFile);

				resizeImage(Report_Path + Screen_File_Name);

				System.out.println("[TR] " + java.lang.Thread.currentThread().getStackTrace()[1].getMethodName() + " : " + Text + Report_Path + Screen_File_Name );

				if (OSType.contains("Mac")) {
					test.log(Status.PASS, Text).addScreenCaptureFromPath("image/"+ Screen_File_Name);
				} else {
					test.log(Status.PASS, Text).addScreenCaptureFromPath("image\\" + Screen_File_Name);
				}


			} catch (Exception eee) {
				System.err.println("[ER] Failed to save file(" + Report_Path + Screen_File_Name + ")");

				driver.quit();
			}
		}
	}

	private static ExtentReports createReport() throws Exception {
		if(extent != null) return extent;

		PackageName = PackageName.substring(0, PackageName.length()-2);
		String reportName = PackageName + " Result";

		String reportPath = "report/" + timestamp(MONTH) + "/" + timestamp(FOLDER) +  "/result.html";
		String reportFile= new File(reportPath).getAbsolutePath();
		if (new File(reportPath).isFile()) {
			new File(reportPath).delete();
		}
		System.out.println("reportFile-"+reportFile);
		htmlReporter = new ExtentHtmlReporter(reportFile);
		htmlReporter.setAppendExisting(true);

		htmlReporter.config().setDocumentTitle(PackageName);
		htmlReporter.config().setEncoding("utf-8");
		htmlReporter.config().setReportName(reportName);
		htmlReporter.config().setTestViewChartLocation(ChartLocation.TOP);
		htmlReporter.config().setChartVisibilityOnOpen(true);
		htmlReporter.config().setCSS("body:not(.default) {overflow: scroll !important;}");

		extent = new ExtentReports();

		extent.setSystemInfo("browser", browser_type);

		extent.attachReporter(htmlReporter);
		return extent;
	}


	public static String timestamp(int Type ) {

		if (Type == FNAME) {
			return new SimpleDateFormat("yyyy-MM-dd HH-mm-ss").format(new Date());
		}
		else if (Type == MONTH){
			return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()).substring(4, 6);

		} else {
			return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()).substring(2, 10);
		}
	}

	public static void resizeImage(String path) throws Exception {
		/*
		try {
            // 썸네일 가로사이즈
            int thumbnail_width = 320;
            // 썸네일 세로사이즈
            int thumbnail_height = 480;

            // 원본이미지파일의 경로+파일명
            File origin_file_name = new File(path + ".jpeg");
            // 생성할 썸네일파일의 경로+썸네일파일명
            File thumb_file_name = new File(path + ".jpeg");

            BufferedImage buffer_original_image = ImageIO.read(origin_file_name);
            BufferedImage buffer_thumbnail_image = new BufferedImage(thumbnail_width, thumbnail_height,
                    BufferedImage.TYPE_3BYTE_BGR);
            Graphics2D graphic = buffer_thumbnail_image.createGraphics();
            graphic.drawImage(buffer_original_image, 0, 0, thumbnail_width, thumbnail_height, null);
            ImageIO.write(buffer_thumbnail_image, "jpg", thumb_file_name);
            origin_file_name.delete();

        } catch (Exception e) {
            e.printStackTrace();
        }
        */
	}

	public static void scollPage(String path) throws Exception {

		by = By.xpath(path);
		JavascriptExecutor jse = (JavascriptExecutor)driver;
		WebElement element = driver.findElement(by);

		jse.executeScript("arguments[0].scrollIntoView();", element);
	}

	public static void scollPageId(String id) throws Exception {

		by = By.id(id);
		JavascriptExecutor jse = (JavascriptExecutor) driver;
		WebElement element = driver.findElement(by);

		jse.executeScript("arguments[0].scrollIntoView();", element);
	}

	public static void scollPageName(String name) throws Exception {

		by = By.className(name);
		JavascriptExecutor jse = (JavascriptExecutor) driver;
		WebElement element = driver.findElement(by);

		jse.executeScript("arguments[0].scrollIntoView();", element);
	}

	public static void Log(String str) throws Exception{
		System.out.println("[TR] ========== " + str + " ==========");
	}

	public static void runProcess() throws Exception {

		String Command;
		String Path = System.getProperty("user.dir");

		if (OSType.contains("Mac")) {

			Path += "/report/";

			// 기존 image 폴더 삭제
			Command = "rm -rf ";
			Command += Path;
			Command += "image";
			Runtime.getRuntime().exec(Command);
			System.out.println("[TR] " + Command);

			// 기존 result.html 삭제
			Command = "rm -rf ";
			Command += Path;
			Command += "result.html";
			Runtime.getRuntime().exec(Command);
			System.out.println("[TR] " + Command);

			// 최신 report 복사
			Command = "cp -r ";
			Command += Path;
			Command += "/";
			Command += timestamp(MONTH);
			Command += "/";
			Command += timestamp(FOLDER);
			Command += "/* ";
			Command += System.getProperty("user.dir");
			Command += "/report/";
			Runtime.getRuntime().exec(Command);
			System.out.println("[TR] " + Command);

		} else {

			Path += "\\report\\";


			// 기존 image 폴더 삭제
			Command = "C:\\Windows\\System32\\cmd.exe /c rmdir /s /q \"";
			Command += Path;
			Command += "image\"";

			Process p1 = Runtime.getRuntime().exec(Command);
			BufferedInputStream in = new BufferedInputStream(p1.getInputStream());
		    byte[] bytes = new byte[8192];
		    while (in.read(bytes) != -1) {}

		    p1.waitFor();
			p1.destroy();

			System.out.println("[TR] " + Command);

			// 최신 report 복사
			Command = "C:\\Windows\\System32\\cmd.exe /c xcopy /s /Y \"";
			Command += Path;
			Command += "\\";
			Command += timestamp(MONTH);
			Command += "\\";
			Command += timestamp(FOLDER);
			Command += "\\*\" \"";
			Command += System.getProperty("user.dir");
			Command += "\\report\\\"";

			Process p2 = Runtime.getRuntime().exec(Command);
			in = new BufferedInputStream(p2.getInputStream());
		    bytes = new byte[8192];
		    while (in.read(bytes) != -1) {}
			p2.waitFor();
			p2.destroy();

			System.out.println("[TR] " + Command);

		}

	}

	public static void Login() throws Exception {
		Thread.sleep(2000);

    	sendKeys(ID, "loginName", "qaautoso07");
    	Thread.sleep(1000);

    	driver.findElement(By.xpath("/html/body/div[2]/form[3]/div/div/div/div[2]/div/div/fieldset/div[2]/ul/li[2]/input")).click();
		Thread.sleep(1000);
		sendKeys(PATH, "/html/body/div[2]/form[3]/div/div/div/div[2]/div/div/fieldset/div[2]/ul/li[2]/input", "5t4r3e2w1q");

    	driver.findElement(By.cssSelector("input.btn_login")).click();

		Thread.sleep(2000);
	}

	public static void sendKeys(int Type, String Path, String Value) throws Exception {
		if (Type == ID) {
			JavascriptExecutor js = (JavascriptExecutor)driver;
	    	js.executeScript("document.getElementById('"+Path+"').value='"+Value+"'");
		}
		else if (Type == PATH) {
			by = By.xpath(Path);
			WebElement element = driver.findElement(by);
			JavascriptExecutor jse = (JavascriptExecutor)driver;

	    	jse.executeScript("arguments[0].setAttribute('value'," + "'" + Value + "' )", element);
	    	Thread.sleep(1000);
		}
	}

	public String changeDisplayYN(String prdNo, String YN) throws Exception{
		String body =
		        given()
		        .header("Accept-Language", "ko-KR")
	            .header("Host", "bo.11st.co.kr")
	            .header("Accept-Encoding", "gzip, deflate")
	            .header("x-requested-with", "XMLHttpRequest")
	            .header("Accept", "*/*")
	            .header("Cookie","WMONID=Qx1cC8CUN3b; flag=true; BACK_LOGIN_TIME_CHK=1501156327560; JSESSIONID=7neDyUeQncl2tfsI7JkgKJdLU4U_xH-mEmulFEZmuCJZiQRepnXa!990128361; TP=ENCRYPT_VER%7C1; TMALL_AUTH_BACK=S77u4pI3QXonwFxAQfUOEHaJpa%2B4c0t3kLbpkpULJfjg8qg0%2BQjONON4tJ9qsKteRlyfV4PZoZSI%0A3eIMqskKaTZBavjwVxDz%2FUNMPX5rRpOpW96B5PMNjJHVvoiY6qU42BZ7%2FALFT1StkycKxoQZMP2o%0Ao5X3ZzomO064lMbBe6E%3D; TMALL_KEY_VALUE=UxW2YkWQFzvOMSgFUBox2Q%3D%3D")
	            .header("Referer", "http://bo.11st.co.kr/product/ProductSearchAction.tmall?method=getSellProductSearchList&menuNo=4001")
	            .header("Content-Type", "application/x-www-form-urlencoded")
	            .body("chkPrdNo="+prdNo+",&chkPrdNoList=&chkPrdNoCount=&level=1&categoryType=D&currentPageNo=1&priceEnuri=&priceDaum=&priceDanawa=&category0=&category1=&category2=&category3=&category4=&dateType=CREATE&sltDuration=ALL&createDt=&createDtTo=&prdGubun=prd&prdNo=1812307871&memId=&gblDlvYn=&engDispYn=&selMthdCd=&selStatCd=&mobilePrdYn=&brandCd=&dlvClf=&cupnIssCnYn=&minorSelCnYn=&displayYn=&approvalStat=&movieYn=&reglDlvYn=&mnbdClfCd=&compPrdYn=&dataGrid=-1&pagePerSize=50")
		        .when()
		            .post("http://bo.11st.co.kr/product/ProductSearchActionAjax.tmall?method=updateDisplayYnJSON&chkDisplayYn="+YN)
		        .then()
		            .extract().asString();
		return body;
	}

	public boolean isAlertPresents() {
		try {
			driver.switchTo().alert();
			return true;
			}// try
			catch (Exception e) {
			return false;
			}// catch
	}


	@After
	public void afterMethod() throws Exception {

		extent.flush();
	}

	@AfterClass
	public static void CloseEnvironment() throws Exception {

		extent.flush();
		if (driver != null) {
			driver.quit();
		}

		runProcess();
	}
}

